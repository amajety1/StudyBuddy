import React, { useEffect, useState } from 'react';

const ChatsLHS = ({ onSelectChatroom, selectedChatroomId }) => {
    const [chatrooms, setChatrooms] = useState([]);

    useEffect(() => {
        const fetchChatrooms = async () => {
            try {
                const response = await fetch('/api/chatrooms');
                if (!response.ok) {
                    throw new Error('Failed to fetch chatrooms');
                }
                const data = await response.json();
                setChatrooms(data);
            } catch (error) {
                console.error('Error fetching chatrooms:', error);
            }
        };

        fetchChatrooms();
    }, []);

    return (
        <div className="chats-lhs">
            <h2>Your Chats</h2>
            <div className="chatroom-list">
                {chatrooms.map((chatroom) => (
                    <div
                        key={chatroom._id}
                        className={`chatroom-item ${selectedChatroomId === chatroom._id ? 'selected' : ''}`}
                        onClick={() => onSelectChatroom(chatroom._id)}
                    >
                        <h3>{chatroom.name}</h3>
                        <p>{chatroom.latestMessage?.content || 'No messages yet'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatsLHS;