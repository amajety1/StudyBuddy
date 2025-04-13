import React, { useState, useEffect, useRef } from 'react';
import ChatExpandedWindow from './ChatExpandedWindow';
import io from 'socket.io-client';

const BASE_URL = 'http://localhost:5001';

// Utility function to resolve image URLs with fallback
const getImageUrl = (profilePicture, userId) => {
  if (!profilePicture || profilePicture === 'null') {
    return `https://api.dicebear.com/7.x/adventurer/png?seed=${userId}`;
  }
  if (profilePicture.startsWith('http')) return profilePicture;

  const filename = profilePicture.split('/').pop();
  return `${BASE_URL}/api/images/${filename}`;
};

const Chatbox = ({ chatroom, currentUser, onClick, isExpanded, isMinimized, onMinimize, onClose }) => {
  const [isExpandedState, setIsExpanded] = useState(isExpanded);
  const [unreadCount, setUnreadCount] = useState(chatroom.unreadCount || 0);
  const [lastMessagePreview, setLastMessagePreview] = useState('');
  const socket = useRef(null);

  // Socket.IO: Listen for last message updates
  useEffect(() => {
    socket.current = io(BASE_URL);

    socket.current.on('update_last_message', (data) => {
      if (data.chatroomId === chatroom._id) {
        const message = data.lastMessage;
        const senderPrefix = message.sender._id === currentUser._id ? 'You' : message.sender.firstName;
        const preview = `${senderPrefix}: ${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}`;
        setLastMessagePreview(preview);
      }
    });

    return () => {
      socket.current.off('update_last_message');
      socket.current.disconnect();
    };
  }, [chatroom._id, currentUser._id]);

  // Initial load: compute last message preview
  useEffect(() => {
    const messages = chatroom.messages || [];
    const lastMessage = messages.length > 0 ? messages[0] : null;
    const preview = lastMessage
      ? `${lastMessage.sender._id === currentUser._id ? 'You' : lastMessage.sender.firstName}: ${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? '...' : ''}`
      : 'No messages yet';
    setLastMessagePreview(preview);
  }, [chatroom.messages, currentUser._id]);

  // Chat title: Group name or other participant
  const getChatTitle = () => {
    if (chatroom.isGroupChat) {
      return chatroom.groupName || 'Unnamed Group';
    } else {
      const otherParticipant = chatroom.participants.find(p => p._id !== currentUser._id);
      return otherParticipant
        ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
        : 'Unknown User';
    }
  };

  // Chat photo: Group photo or other user's profile picture
  const getChatPhoto = () => {
    if (chatroom.isGroupChat) {
      return getImageUrl(chatroom.groupPhoto, chatroom._id);
    } else {
      const otherParticipant = chatroom.participants.find(p => p._id !== currentUser._id);
      return getImageUrl(otherParticipant?.profilePicture, otherParticipant?._id);
    }
  };

  const handleClick = () => {
    setIsExpanded(true);
    setUnreadCount(0);
    if (onClick) onClick(); // In case parent handler is needed
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
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://api.dicebear.com/7.x/adventurer/png?seed=${chatroom._id}`;
            }}
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
