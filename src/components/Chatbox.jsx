import React, { useState } from 'react';
import ChatExpandedWindow from './ChatExpandedWindow';

const Chatbox = ({ chatroom, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(chatroom.unreadCount || 0);

  // Get the display title based on chat type
  const getChatTitle = () => {
    if (chatroom.isGroupChat) {
      return chatroom.displayTitle;
    } else {
      const otherParticipant = chatroom.participants.find(
        p => p._id !== currentUser._id
      );
      return otherParticipant 
        ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
        : 'Unknown User';
    }
  };

  // Get the display photo based on chat type
  const getChatPhoto = () => {
    if (chatroom.isGroupChat) {
      return chatroom.displayPhoto || '/images/default-group.jpeg';
    } else {
      console.log('HEREEEEE')
      const otherParticipant = chatroom.participants.find(
        p => p._id !== currentUser._id
      );
      console.log("OTHER PARTICIPANT: ", otherParticipant)
      return otherParticipant?.profilePicture || '/images/default-profile.jpeg';
    }
  };

  const lastMessage = chatroom.messages?.[0];
  const lastMessagePreview = lastMessage 
    ? `${lastMessage.sender.firstName}: ${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? '...' : ''}`
    : 'No messages yet';

  const handleClick = () => {
    setIsExpanded(true);
    setUnreadCount(0); // Reset unread count when opening chat
  };

  return (
    <>
      <div 
        className={`chatbox ${unreadCount > 0 ? 'has-unread' : ''} ${chatroom.isGroupChat ? 'group-chat' : ''}`}
        onClick={handleClick}
      >
        <div className="chat-header">
          <img 
            src={getChatPhoto()} 
            alt={getChatTitle()}
            className="chat-avatar"
          />
          <div className="chat-info">
            <div className="chat-title">
              {getChatTitle()}
              {chatroom.isGroupChat && <span className="group-indicator">Group</span>}
            </div>
            <div className="last-message">{lastMessagePreview}</div>
          </div>
          {unreadCount > 0 && (
            <div className="unread-badge">{unreadCount}</div>
          )}
        </div>
      </div>

      {isExpanded && (
        <ChatExpandedWindow
          chatroom={{
            ...chatroom,
            displayTitle: getChatTitle(),
            displayPhoto: getChatPhoto()
          }}
          currentUser={currentUser}
          onClose={() => setIsExpanded(false)}
          setUnreadCount={setUnreadCount}
        />
      )}
    </>
  );
};

export default Chatbox;