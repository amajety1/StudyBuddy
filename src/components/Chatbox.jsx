import React from 'react';

function Chatbox({ chatroom, currentUser, onClick, isSelected }) {
    if (!chatroom || !currentUser) return null;

    // Find the other participant in the chat
    const otherParticipant = chatroom.participants.find(
        participant => participant._id !== currentUser._id
    );

    if (!otherParticipant) return null;

    return (
        <div
            className={`chatbox ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="chatbox-profile-pic">
                <img
                    src={otherParticipant.profilePicture || "/images/empty-profile-pic.png"}
                    alt="Profile"
                />
            </div>
            <div className="chatbox-info">
                <div className="chatbox-name">
                    {otherParticipant.name || `${otherParticipant.firstName} ${otherParticipant.lastName}`}
                </div>
                {chatroom.lastMessage && (
                    <div className="chatbox-last-message">
                        {chatroom.lastMessage.content}
                    </div>
                )}
                {chatroom.lastMessage && (
                    <div className="chatbox-time">
                        {new Date(chatroom.lastMessage.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chatbox;