import React, { useState, useEffect, useRef } from 'react';
import ChatExpandedWindow from './ChatExpandedWindow';
import io from 'socket.io-client';

const Chatbox = ({ chatroom, currentUser, onClick, isExpanded, isMinimized, onMinimize, onClose }) => {
  const [isExpandedState, setIsExpanded] = useState(isExpanded);
  const [unreadCount, setUnreadCount] = useState(chatroom.unreadCount || 0);
  const [lastMessagePreview, setLastMessagePreview] = useState('');
  const socket = useRef(null);

  useEffect(() => {
    // Initialize socket
    socket.current = io('http://localhost:5001');

    // Listen for last message updates
    socket.current.on('update_last_message', (data) => {
      if (data.chatroomId === chatroom._id) {
        const message = data.lastMessage;
        const senderPrefix = message.sender._id === currentUser._id ? 'You' : message.sender.firstName;
        const preview = `${senderPrefix}: ${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}`;
        setLastMessagePreview(preview);
      }
    });

    return () => {
      if (socket.current) {
        socket.current.off('update_last_message');
        socket.current.disconnect();
      }
    };
  }, [chatroom._id, currentUser._id]);

  useEffect(() => {
    // Set initial last message preview
    const messages = chatroom.messages || [];
    const lastMessage = messages.length > 0 ? messages[0] : null; // Get first message since they're sorted by timestamp DESC
    const preview = lastMessage 
      ? `${lastMessage.sender._id === currentUser._id ? 'You' : lastMessage.sender.firstName}: ${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? '...' : ''}`
      : 'No messages yet';
    setLastMessagePreview(preview);
  }, [chatroom.messages, currentUser._id]);

  // Get the display title based on chat type
  const getChatTitle = () => {
    if (chatroom.isGroupChat) {
      return chatroom.groupName;
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
      return chatroom.groupPhoto || '/images/default-group.jpeg';
    } else {
      
      const otherParticipant = chatroom.participants.find(
        p => p._id !== currentUser._id
      );
      
      return otherParticipant?.profilePicture || '/images/default-profile.jpeg';
    }
  };

  const handleClick = () => {
    setIsExpanded(true);
    setUnreadCount(0); // Reset unread count when opening chat
  };

  return (
    <>
      <div 
        className={`chatbox ${unreadCount > 0 ? 'has-unread' : ''} ${chatroom.isGroupChat ? 'group-chat' : ''} ${isExpandedState ? 'expanded' : ''} ${isMinimized ? 'minimized' : ''}`}
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

      {isExpandedState && (
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