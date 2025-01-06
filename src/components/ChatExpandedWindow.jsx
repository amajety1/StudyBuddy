import React, { useState, useEffect, useRef } from 'react';
import ChatExpandedWindowMessages from './ChatExpandedWindowMessages';
import { io } from 'socket.io-client';

const chatWindowStyle = {
    position: 'fixed',
    bottom: '0',
    right: '350px',
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
    handleChatMinimizeClick,
}) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showParticipants, setShowParticipants] = useState(false);
    const messagesEndRef = useRef(null);
    const socket = useRef(null); // Use useRef for socket

    useEffect(() => {
        // Initialize Socket.IO
        socket.current = io('http://localhost:5001');

        if (chatroom) {
            socket.current.emit("join_chat", chatroom._id);
            // Fetch existing messages
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
            const response = await fetch(`http://localhost:5001/api/chatrooms/${chatroom._id}/messages`, {
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
            console.log('Received message:', message);
            if (message.chatroomId === chatroom._id) {
                setMessages(prevMessages => [...prevMessages, message]);
                scrollToBottom();
            }
        });

        socket.current.on("message_error", (error) => {
            console.error('Message error:', error);
        });
    
        return () => {
            if (socket.current) {
                socket.current.off("message_received");
                socket.current.off("message_error");
            }
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

    if (!chatroom || !currentUser) {
        return null;
    }

    return (
        <div 
            className={`chat-expanded-window ${isChatWindowMinimized ? 'minimized' : ''}`}
            style={chatWindowStyle}
        >
            <div className="chat-expanded-window-title" style={chatHeaderStyle}>
                <div className="chat-expanded-window-title-left-profile-and-name">
                    <img 
                        src={chatroom.displayPhoto} 
                        alt={chatroom.displayTitle} 
                        style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    <h3 style={{ margin: 0 }}>{chatroom.displayTitle}</h3>
                    {chatroom.isGroupChat && (
                        <button 
                            className="participants-toggle"
                            onClick={() => setShowParticipants(!showParticipants)}
                            style={{ marginLeft: '10px' }}
                        >
                            {showParticipants ? 'Hide' : 'Show'} Participants
                        </button>
                    )}
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

            {showParticipants && chatroom.isGroupChat && (
                <div className="participants-list">
                    <h4>Group Members</h4>
                    {chatroom.participants.map(participant => (
                        <div key={participant._id} className="participant-item">
                            <img 
                                src={participant.profilePicture || '/images/default-profile.jpeg'} 
                                alt={participant.firstName} 
                                className="participant-avatar"
                            />
                            <span>{participant.firstName} {participant.lastName}</span>
                        </div>
                    ))}
                </div>
            )}

            <div style={chatMessagesStyle}>    
                <ChatExpandedWindowMessages 
                    messages={messages} 
                    currentUser={currentUser}
                    isGroupChat={chatroom.isGroupChat}/>
               
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={chatInputStyle}>
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
