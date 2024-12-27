function MessagesRHS({ group }) {
  return (
    <div className="messages-rhs">
      <div className="messages-rhs-header">
        <img src={group.image} alt={`${group.name} icon`} />
        <h1 className="noto-sans">{group.name} Chats</h1>
      </div>
      <div className="messages-rhs-messages">
        {group.messages.map((message, index) => (
          <div key={index} className="messages-rhs-message">
            <p className="noto-sans message-time">{message.time}</p>
            <div className="message-img-and-text">
              <img src={message.pic} alt={`${message.sender}'s profile`} />
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
