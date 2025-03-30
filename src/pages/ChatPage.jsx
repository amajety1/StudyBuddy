import React, { useState, useEffect } from "react";
import ChatsLHS from "../components/ChatsLHS";
import MessagesRHS from "../components/MessagesRHS.jsx";

function ChatPage() {
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleSelectChatroom = async (chatroomId) => {
    setSelectedChatroom(chatroomId);
    try {
      const response = await fetch(`/api/chatrooms/${chatroomId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <div className="chat-page">
      <ChatsLHS 
        onSelectChatroom={handleSelectChatroom}
        selectedChatroomId={selectedChatroom}
      />
      <MessagesRHS 
        messages={messages}
        chatroomId={selectedChatroom}
      />
    </div>
  );
}

export default ChatPage;