import React, { useRef, useEffect } from 'react';

const placeholderStyle = {
    width: '40px',  // Same width as profile images
    height: '40px', // Same height as profile images
    marginRight: '10px',
    marginLeft: '10px',
    visibility: 'hidden'
};

function ChatExpandedWindowMessages({ messages, currentUser, isGroupChat }) {
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!messages || !currentUser) return null;

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="chat-expanded-window-messages">
            {messages.map((message, index) => {
                // Compare the sender's ID with current user's ID
                const isSender = message.sender._id === currentUser._id || message.sender === currentUser._id;
                
                // Check if this message is part of a sequence from the same sender
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const isSequence = previousMessage && 
                    (previousMessage.sender._id === message.sender._id || 
                     previousMessage.sender === message.sender);

                // Check if this is the last message in a sequence
                const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                const isLastInSequence = !nextMessage || 
                    (nextMessage.sender._id !== message.sender._id && 
                     nextMessage.sender !== message.sender);

                const showSenderName = isGroupChat && !isSender;

                return (
                    <div
                        key={message._id || index}
                        className={isSender ? 'expanded-chat-sending-sequence' : 'expanded-chat-receiving-sequence'}
                    >
                        {!isSender && !isSequence && (
                            <img
                                className="expanded-chat-receiving-sequence-image"
                                src={message.sender.profilePicture || "/images/empty-profile-pic.png"}
                                alt="Profile"
                            />
                        )}
                        {!isSender && isSequence && (
                            <div style={placeholderStyle} />
                        )}
                        <div className={isSender ? 'sending-sequence-messages' : 'receiving-sequence-messages'}>
                            {showSenderName && (
                                <div className="message-sender">
                                    {message.sender.firstName} {message.sender.lastName}
                                </div>
                            )}
                            <p>{message.content}</p>
                            {isLastInSequence && (
                                <span className="message-time">
                                    {formatTime(message.timestamp)}
                                </span>
                            )}
                        </div>
                        {isSender && !isSequence && (
                            <img
                                className="expanded-chat-sending-sequence-image"
                                src={currentUser.profilePicture || "/images/empty-profile-pic.png"}
                                alt="Profile"
                            />
                        )}
                        {isSender && isSequence && (
                            <div style={placeholderStyle} />
                        )}
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}

export default ChatExpandedWindowMessages;