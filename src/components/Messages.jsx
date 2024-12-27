import React, { useState } from 'react'
import ChatExpandedWindow from './ChatExpandedWindow';
function Messages() {

    const [isMessagesOpen, setIsMessagesOpen] = useState(true);
    const handleMessageArrowClick = () => {
        setIsMessagesOpen(!isMessagesOpen);
    };
    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const handleChatCloseClick = () => {
        setIsChatWindowOpen(false);
    }

    const handleChatOpenClick = () => {
        setIsChatWindowOpen(true);
        setIsChatWindowMinimized(false);
    }

    const [isChatWindowMinimized, setIsChatWindowMinimized] = useState(false);
    const handleChatMinimizeClick = () => {
        setIsChatWindowMinimized(!isChatWindowMinimized);
    }
    return (
        <div>
           <ChatExpandedWindow
                isChatWindowOpen={isChatWindowOpen}
                setIsChatWindowOpen={setIsChatWindowOpen}
                isChatWindowMinimized={isChatWindowMinimized}
                setIsChatWindowMinimized={setIsChatWindowMinimized}
                handleChatCloseClick={handleChatCloseClick}
                handleChatMinimizeClick={handleChatMinimizeClick}
            />
            <div className='messages' style={isMessagesOpen ? { height: '20px' } : { height: '80%' , 'overflow-y': 'auto', 'max-height': '500px'}}>
                
                <div className="message-box-title">
                    <p className="noto-sans">Messaging</p><img src={!isMessagesOpen ? "images/down-arrow.png":"images/up-arrow-messages.png"} onClick={handleMessageArrowClick}></img>
                </div>
                <div className='chatboxes' style={isMessagesOpen ? { display: 'none' } : { display: 'block' }}>
                    <div className='chatbox' onClick={handleChatOpenClick}>
                        <img className='chatbox-image' src="/images/chatbox-pic-profile.jpeg"></img>
                        <div className="chatbox-title-and-message">
                            <h3>Amelia Walker</h3>
                            <p>Amelia: Hey let's study...</p>
                        </div>
                        
                    </div>
                    <div className='chatbox'>
                        <img className='chatbox-image' src="/images/chatbox-pic-profile.jpeg"></img>
                        <div className="chatbox-title-and-message">
                            <h3>Amelia Walker</h3>
                            <p>Amelia: Hey let's study...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
    )}

export default Messages