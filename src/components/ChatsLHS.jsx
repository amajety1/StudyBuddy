function ChatsLHS({ groupMessageInfo, setMessageGroupID }) {
    return (
      <div className="chats-lhs">
        <div className="chats-lhs-header">
          <h1 className="noto-sans">Chats</h1>
        </div>
        <div className="chats-lhs-chats">
          {Object.keys(groupMessageInfo).map((groupKey) => {
            const group = groupMessageInfo[groupKey];
            return (
              <div
                key={groupKey}
                className="chats-lhs-chat"
                onClick={() => setMessageGroupID(groupKey)} // Update selected group ID
              >
                <img src={group.image} alt={`${group.name} image`} />
                <p className="noto-sans">{group.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  export default ChatsLHS;
  