import React, { useState, useEffect } from 'react';
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
    const token = localStorage.getItem('token');

    const fetchChatrooms = async () => {
        try {
            const chatsResponse = await fetch('http://localhost:5001/api/users/get-chats', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!chatsResponse.ok) {
                throw new Error(`Failed to fetch chatrooms: ${chatsResponse.status}`);
            }
            
            const chatsData = await chatsResponse.json();
            console.log('Chatrooms received AAAAAHHHHHHH:', chatsData);
            setChatrooms(chatsData);

        } catch (error) {
            //console.error('Error fetching chatrooms:', error);
            setError(error.message);
        }
    };

 

    useEffect(() => {
        const fetchUserAndChats = async () => {
            try {
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
                //console.log('User data received:', userData);
                setCurrentUser(userData);

                // Fetch chatrooms
                await fetchChatrooms();
            } catch (error) {
                //console.error('Error in fetchUserAndChats:', error);
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
        //console.log('Selected chatroom:', chatroom);
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