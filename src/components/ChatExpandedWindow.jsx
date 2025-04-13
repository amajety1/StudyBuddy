import React, { useState, useEffect, useRef } from 'react';
import ChatExpandedWindowMessages from './ChatExpandedWindowMessages';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const chatWindowStyle = {
    position: 'fixed',
    bottom: '0',
    right: '350px',
    width: '320px',
    height: '460px',
    backgroundColor: '#ffffff',
    borderRadius: '12px 12px 0 0',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: '"Segoe UI", sans-serif',
    zIndex: 1000,
};

const chatHeaderStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
};

const chatMessagesStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    backgroundColor: '#f4f6f8',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
};

const chatInputStyle = {
    padding: '12px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#fff',
};

const BASE_URL = 'http://localhost:5001';

const getImageUrl = (profilePicture, userId) => {
    if (!profilePicture || profilePicture === 'null') {
        return `https://api.dicebear.com/7.x/adventurer/png?seed=${userId}`;
    }
    if (profilePicture.startsWith('http')) return profilePicture;
    const filename = profilePicture.split('/').pop();
    return `${BASE_URL}/api/images/${filename}`;
};

function ChatExpandedWindow({ 
    chatroom, 
    currentUser, 
    onClose,
    isChatWindowMinimized,
    handleChatMinimizeClick,
    onChatroomUpdate,
}) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const socket = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        socket.current = io(BASE_URL);

        if (chatroom) {
            socket.current.emit("join_chat", chatroom._id);
            fetchMessages();
        }

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [chatroom]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/chatrooms/${chatroom._id}/messages`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("message_received", (message) => {
            if (message.chatroomId === chatroom._id) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        });

        return () => {
            socket.current.off("message_received");
        };
    }, [chatroom]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket.current) return;

        socket.current.emit("new_message", {
            chatroomId: chatroom._id,
            content: newMessage,
            sender: currentUser._id,
        });

        setNewMessage('');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!chatroom || !currentUser) return null;

    return (
        <div style={chatWindowStyle}>
            <div style={chatHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                        src={getImageUrl(chatroom.displayPhoto, chatroom._id)}
                        alt={chatroom.displayTitle} 
                        style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} 
                    />
                    <h3 style={{ margin: 0, fontWeight: 600 }}>{chatroom.displayTitle}</h3>
                </div>
                <div>
                    <img
                        onClick={handleChatMinimizeClick}
                        src={isChatWindowMinimized ? "/images/up-arrow-messages.png" : "/images/down-arrow.png"}
                        alt="Toggle Minimize"
                        style={{ cursor: 'pointer', marginRight: '10px', width: '20px', height: '20px' }}
                    />
                    <img
                        onClick={onClose}
                        src="/images/close-arrow.png"
                        alt="Close Chat"
                        style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                    />
                </div>
            </div>

            <div style={chatMessagesStyle}>
                <ChatExpandedWindowMessages 
                    messages={messages}
                    currentUser={currentUser}
                    messagesEndRef={messagesEndRef}
                />
            </div>

            <div style={chatInputStyle}>
                <form onSubmit={handleSend}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                borderRadius: '20px',
                                border: '1px solid #ccc',
                                outline: 'none',
                                fontSize: '14px',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#007bff')}
                            onBlur={(e) => (e.target.style.borderColor = '#ccc')}
                        />
                        <button 
                            type="submit"
                            style={{
                                padding: '10px 18px',
                                borderRadius: '20px',
                                border: 'none',
                                backgroundColor: '#007bff',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChatExpandedWindow;
