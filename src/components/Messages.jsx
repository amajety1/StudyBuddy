import React, { useState, useEffect } from 'react';
import ChatExpandedWindow from './ChatExpandedWindow';
import Chatbox from './Chatbox';
import '../styles/Messages.css'; // Updated styles

function Messages() {
    const [chatrooms, setChatrooms] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

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
                setCurrentUser(userData);

                // Fetch chatrooms
                await fetchChatrooms();
            } catch (error) {
                setError(error.message);
            }
        };

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
                setChatrooms(chatsData);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchUserAndChats();
    }, [token]);

    const handleChatSelect = (chatroom) => {
        setSelectedChat(chatroom);
    };

    return (
        <div className="messages-container">
            <div className="chat-sidebar">
                <div className="chat-header">
                    <h3>Chats</h3>
                </div>
                <div className="chat-list">
                    {chatrooms.length > 0 ? (
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
                        <p className="no-chats">No chats available</p>
                    )}
                </div>
            </div>

            <div className="chat-window">
                {selectedChat ? (
                    <ChatExpandedWindow
                        chatroom={selectedChat}
                        currentUser={currentUser}
                        onClose={() => setSelectedChat(null)}
                    />
                ) : (
                    <div className="empty-chat-placeholder">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messages;
