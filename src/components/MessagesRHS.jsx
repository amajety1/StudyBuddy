import React from "react";
import { getImageUrl } from "../imageHelpers";

function MessagesRHS({ group }) {
  return (
    <div className="messages-rhs">
      <div className="messages-rhs-header">
        <img
          src={getImageUrl(group.image, 'group', group._id || group.name)}
          alt={`${group.name} icon`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://api.dicebear.com/7.x/adventurer/png?seed=${group._id || group.name}`;
          }}
        />
        <h1 className="noto-sans">{group.name} Chats</h1>
      </div>

      <div className="messages-rhs-messages">
        {group.messages.map((message, index) => (
          <div key={index} className="messages-rhs-message">
            <p className="noto-sans message-time">{message.time}</p>
            <div className="message-img-and-text">
              <img
                src={getImageUrl(message.pic, 'user', message.senderId || message.sender)}
                alt={`${message.sender}'s profile`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/adventurer/png?seed=${message.senderId || message.sender}`;
                }}
              />
              <h5 className="noto-sans">{message.message}</h5>
            </div>
            <p className="noto-sans">{message.sender}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessagesRHS;
