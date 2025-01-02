import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatExpandedWindow from './ChatExpandedWindow';
import Chatbox from './Chatbox';

function Messages() {
    const [chatrooms, setChatrooms] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isMessagesOpen, setIsMessagesOpen] = useState(false);
    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const [isChatWindowMinimized, setIsChatWindowMinimized] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:5001');
        setSocket(newSocket);

        // Cleanup on unmount
        return () => newSocket.close();
    }, []);

    const fetchChatrooms = async () => {
        try {
            const token = localStorage.getItem('token');
            const chatsResponse = await fetch('http://localhost:5001/api/chatrooms', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!chatsResponse.ok) {
                throw new Error(`Failed to fetch chatrooms: ${chatsResponse.status}`);
            }
            
            const chatsData = await chatsResponse.json();
            console.log('Chatrooms received:', chatsData);
            setChatrooms(chatsData);

            // Update selected chat if it exists
            if (selectedChat) {
                const updatedSelectedChat = chatsData.find(chat => chat._id === selectedChat._id);
                if (updatedSelectedChat) {
                    setSelectedChat(updatedSelectedChat);
                }
            }
        } catch (error) {
            console.error('Error fetching chatrooms:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (!socket) return;

        // Listen for new messages
        socket.on('new message', (message) => {
            setChatrooms(prevChatrooms => 
                prevChatrooms.map(chatroom => {
                    // If this is the chatroom that received the message
                    if (chatroom._id === message.chatRoom) {
                        return {
                            ...chatroom,
                            lastMessage: message, // Update the last message
                            messages: chatroom.messages 
                                ? [message, ...chatroom.messages]
                                : [message]
                        };
                    }
                    return chatroom;
                })
            );
        });

        // Listen for unread count updates
        socket.on('unread count update', ({ roomId, count }) => {
            setChatrooms(prevChatrooms => 
                prevChatrooms.map(chatroom => 
                    chatroom._id === roomId 
                        ? { ...chatroom, unreadCount: count }
                        : chatroom
                )
            );
        });

        return () => {
            socket.off('new message');
            socket.off('unread count update');
        };
    }, [socket]);

    useEffect(() => {
        const fetchUserAndChats = async () => {
            try {
                console.log('Fetching user and chats...');
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    setError('Please log in to view messages');
                    return;
                }

                // Fetch current user
                console.log('Fetching current user...');
                const userResponse = await fetch('http://localhost:5001/api/users/me', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!userResponse.ok) {
                    throw new Error(`Failed to fetch user: ${userResponse.status}`);
                }
                
                const userData = await userResponse.json();
                console.log('User data received:', userData);
                setCurrentUser(userData);

                // Fetch chatrooms
                await fetchChatrooms();
            } catch (error) {
                console.error('Error in fetchUserAndChats:', error);
                setError(error.message);
            }
        };

        fetchUserAndChats();
    }, []);

    const handleMessageArrowClick = () => {
        setIsMessagesOpen(!isMessagesOpen);
    };

    const handleChatCloseClick = () => {
        setIsChatWindowOpen(false);
        setSelectedChat(null);
    };

    const handleChatOpenClick = () => {
        setIsChatWindowOpen(true);
        setIsChatWindowMinimized(false);
    };

    const handleChatMinimizeClick = () => {
        setIsChatWindowMinimized(!isChatWindowMinimized);
    };

    const handleChatSelect = (chatroom) => {
        console.log('Selected chatroom:', chatroom);
        setSelectedChat(chatroom);
        setIsChatWindowOpen(true);
        setIsChatWindowMinimized(false);
    };

    return (
        <div className="messages-container">
            {error && (
                <div className="error-message" style={{ color: 'red', padding: '10px' }}>
                    {error}
                </div>
            )}
            
            {selectedChat && isChatWindowOpen && (
                <ChatExpandedWindow
                    chatroom={selectedChat}
                    currentUser={currentUser}
                    isChatWindowMinimized={isChatWindowMinimized}
                    handleChatMinimizeClick={handleChatMinimizeClick}
                    onClose={handleChatCloseClick}
                />
            )}
            
            <div className='messages' style={
                isMessagesOpen 
                    ? { height: '20px' } 
                    : { 
                        height: '80%',
                        overflowY: 'auto',
                        maxHeight: '500px'
                    }
            }>
                <div className="message-box-title">
                    <p className="noto-sans">Messaging</p>
                    <img 
                        src={isMessagesOpen ? "/images/up-arrow-messages.png" : "/images/down-arrow.png"}
                        onClick={handleMessageArrowClick}
                        alt="Toggle messages"
                        className="message-arrow"
                    />
                </div>
                
                <div className='chatboxes' style={isMessagesOpen ? { display: 'none' } : { display: 'block' }}>
                    {chatrooms && chatrooms.length > 0 ? (
                        chatrooms.map((chatroom) => (
                            <Chatbox
                                key={chatroom._id}
                                chatroom={chatroom}
                                currentUser={currentUser}
                                onClick={() => handleChatSelect(chatroom)}
                                isSelected={selectedChat?._id === chatroom._id}
                            />
                        ))
                    ) : (
                        <div className="no-chats-message" style={{ padding: '10px', textAlign: 'center' }}>
                            {error ? 'Error loading chats' : 'No chats available'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Messages;