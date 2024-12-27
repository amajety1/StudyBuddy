import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Matches from "../components/Matches";
import Messages from "../components/Messages";
import React, { useState } from 'react';
import ChatsLHS from '../components/ChatsLHS';
import MessagesRHS from '../components/MessagesRHS.jsx';

function ChatPage() {

    const [messageWindowOpen, setMessageWindowOpen] = useState(false);
    const [messageGroupID, setMessageGroupID] = useState(null);
    const [groupMessageInfo, setGroupMessageInfo] = useState({
        group1:{
            name:"Group 1",
            image:"/images/group.jpg",
            messages:[{
                message:"Hello",
                sender:"user1",
                time:"9:00 PM",
                pic:"/images/group.jpg"
            },
            {
                message:"Hey",
                sender:"user2",
                time:"9:00 PM",
                pic:"/images/group.jpg"
            },
            {
                message:"wya?",
                sender:"user3",
                time:"9:00 PM",
                pic:"/images/group.jpg"
            } ]
        },
        
        group2:{
            name:"Group 2",
            image:"/images/group.jpg",
            messages:[{
                message:"Hello",
                sender:"user1",
                time:"9:00 PM",
                pic:"/images/group.jpg"
            },
            {
                message:"Hey",
                sender:"user2",
                time:"9:00 PM",
                pic:"/images/group.jpg"
            },
            {
                message:"wya?",
                sender:"user3",
                time:"9:00 PM",
                pic:"/images/group.jpg"
            } ]
        },

        group3:{
            name:"Group 3",
            image:"/images/group.jpg",
            messages:[{
                message:"Hello",
                sender:"user1",
                time:"9:00 PM",
                pic:"/images/group.jpg"
            },
            {
                message:"Hey",
                sender:"user2",
                time:"9:00 PM",
                pic:"/images/group.jpg"
            },
            {
                message:"wya?",
                sender:"user3",
                time:"9:00 PM",
                pic:"/images/group.jpg"
            } ]
        }
    })

    return (
        <div>
            <Header/>
            <Navbar/>
            <div className='chats-and-messages'>
            <ChatsLHS 
        groupMessageInfo={groupMessageInfo} 
        setMessageGroupID={setMessageGroupID} 
      />
                
            {messageGroupID && (
            <MessagesRHS 
            group={groupMessageInfo[messageGroupID]} 
            />
      )}
                {!messageGroupID &&
                <div className='messages-rhs'>
                    <h1>Click on group to view messages</h1>
                </div>
                }
            </div>
            
            
        </div>
    );
}

export default ChatPage;