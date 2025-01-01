import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatExpandedWindowMessages from './ChatExpandedWindowMessages';

const chatWindowStyle = {
    position: 'fixed',
    bottom: '0',
    right: '350px', // Moved more to the left to not cover Messages
    width: '300px',
    height: '400px',
    backgroundColor: 'white',
    borderRadius: '10px 10px 0 0',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
};

const chatHeaderStyle = {
    padding: '10px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const chatMessagesStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
};

const chatInputStyle = {
    padding: '10px',
    borderTop: '1px solid #eee',
    backgroundColor: 'white',
};

function ChatExpandedWindow({ 
    chatroom, 
    currentUser, 
    onClose,
    isChatWindowMinimized,
    handleChatMinimizeClick
}) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [socket, setSocket] = useState(null);

    // Prevent scroll propagation
    const handleScroll = (e) => {
        e.stopPropagation();
    };

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:5001');
        setSocket(newSocket);

        // Cleanup on unmount
        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (!socket || !chatroom) return;

        // Join the chat room
        socket.emit('join room', chatroom._id);

        // Listen for new messages
        socket.on('new message', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        // Listen for errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Cleanup when leaving room
        return () => {
            socket.emit('leave room', chatroom._id);
            socket.off('new message');
            socket.off('error');
        };
    }, [socket, chatroom]);

    useEffect(() => {
        if (!chatroom || !currentUser) return;

        // Find the other participant
        const other = chatroom.participants.find(
            participant => participant._id !== currentUser._id
        );
        setOtherUser(other);

        // Set initial messages from chatroom
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/chatrooms/${chatroom._id}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) throw new Error('Failed to fetch messages');
                
                const fetchedMessages = await response.json();
                setMessages(fetchedMessages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [chatroom, currentUser]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        try {
            // Emit the message through socket
            socket.emit('send message', {
                roomId: chatroom._id,
                content: newMessage,
                sender: currentUser._id
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (!chatroom || !currentUser || !otherUser) {
        return null;
    }

    return (
        <div 
            className={`chat-expanded-window ${isChatWindowMinimized ? 'minimized' : ''}`}
            style={chatWindowStyle}
            onWheel={handleScroll}
        >
            <div className="chat-expanded-window-title" style={chatHeaderStyle}>
                <div className="chat-expanded-window-title-left-profile-and-name">
                    <img 
                        src={otherUser.profilePicture || "/images/empty-profile-pic.png"} 
                        alt="Profile"
                        style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    <h3 style={{ margin: 0 }}>{`${otherUser.firstName} ${otherUser.lastName}`}</h3>
                </div>
                <div className="chat-expanded-window-title-right-down-arrow">
                    <img
                        onClick={handleChatMinimizeClick}
                        src={isChatWindowMinimized ? "/images/up-arrow-messages.png" : "/images/down-arrow.png"}
                        alt="Toggle Minimize"
                        style={{ cursor: 'pointer', marginRight: '10px' }}
                    />
                    <img
                        onClick={onClose}
                        src="/images/close-arrow.png"
                        alt="Close Chat"
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            </div>

            <div style={chatMessagesStyle} onScroll={handleScroll}>
                <ChatExpandedWindowMessages 
                    messages={messages}
                    currentUser={currentUser}
                />
            </div>

            <form onSubmit={handleSendMessage} style={chatInputStyle}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '20px',
                            border: '1px solid #ddd',
                            outline: 'none'
                        }}
                    />
                    <button 
                        type="submit"
                        style={{
                            padding: '8px 15px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#007bff',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatExpandedWindow;
