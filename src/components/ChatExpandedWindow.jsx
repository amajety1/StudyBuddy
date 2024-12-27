import React from "react";

function ChatExpandedWindow({
  isChatWindowOpen,
  isChatWindowMinimized,
  handleChatCloseClick,
  handleChatMinimizeClick,
}) {
  return (
    <div
      className="chat-expanded-window"
      style={{
        display: isChatWindowOpen ? "block" : "none",
        height: isChatWindowMinimized ? "80px" : "80%",
        overflowY: isChatWindowMinimized ? "hidden" : "auto",
        maxHeight: isChatWindowMinimized ? "none" : "500px",
      }}
    >
      <div className="chat-expanded-window-title">
        <div className="chat-expanded-window-title-left-profile-and-name">
          <img src="/images/profile-pic-matches-sample.jpeg" alt="Profile"></img>
          <h3>Anthony Walker</h3>
        </div>
        <div className="chat-expanded-window-title-right-down-arrow">
          <img
            onClick={handleChatMinimizeClick}
            src={
              isChatWindowMinimized
                ? "/images/up-arrow-messages.png"
                : "/images/down-arrow.png"
            }
            alt="Toggle Minimize"
          ></img>
          <img
            onClick={handleChatCloseClick}
            src="/images/close-arrow.png"
            alt="Close Chat"
          ></img>
        </div>
      </div>
      <div className="chat-expanded-window-messages">
        <div className="expanded-chat-receiving-sequence">
          <img
            className="expanded-chat-receiving-sequence-image"
            src="/images/profile-pic-matches-sample.jpeg"
            alt="Profile"
          ></img>
          <div className="receiving-sequence-messages">
            <p>Amelia: Hey let's study...</p>
            <p>How does 5'o clock sound?</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatExpandedWindow;
