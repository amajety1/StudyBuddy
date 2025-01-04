import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Matches from "../components/Matches";
import Messages from "../components/Messages";
import BuddyProfileSection from "../components/BuddyProfileSection";

function BuddyProfile() {
    const { matchId } = useParams();
    const [userData, setUserData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [buddyStatus, setBuddyStatus] = useState('none'); // 'none', 'sent', 'received', 'connected'
    const token = localStorage.getItem('token');

    console.log('BuddyProfile render - matchId:', matchId);
    console.log('BuddyProfile render - token:', token ? 'exists' : 'missing');

    useEffect(() => {
        const fetchUserData = async () => {
            console.log('Starting to fetch user data for matchId:', matchId);
            try {
                // Fetch the buddy's profile data
                console.log('Fetching buddy profile...');
                const response = await fetch(`http://localhost:5001/api/users/profile/${matchId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Buddy profile response status:', response.status);
                const data = await response.json();
                console.log('Buddy profile data:', data);
                setUserData(data);

                // Fetch current user's data to check buddy status
                console.log('Fetching current user data...');
                const currentUserResponse = await fetch('http://localhost:5001/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Current user response status:', currentUserResponse.status);
                const currentUserData = await currentUserResponse.json();
                console.log('Current user data:', currentUserData);
                setCurrentUser(currentUserData);

                // Determine buddy status
                let status = 'none';
                if (currentUserData.buddies?.includes(matchId)) {
                    status = 'connected';
                } else if (currentUserData.outgoingBuddyRequests?.includes(matchId)) {
                    status = 'sent';
                } else if (currentUserData.incomingBuddyRequests?.includes(matchId)) {
                    status = 'received';
                }
                console.log('Determined buddy status:', status);
                setBuddyStatus(status);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (matchId && token) {
            console.log('Conditions met, calling fetchUserData');
            fetchUserData();
        } else {
            console.log('Missing required data:', { matchId, hasToken: !!token });
        }
    }, [matchId, token]);

    const handleBuddyAction = async () => {
        try {
            if (buddyStatus === 'none') {
                // Send buddy request
                console.log('Sending buddy request...');
                const response = await fetch('http://localhost:5001/api/users/send-buddy-request', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ matchId: matchId })
                });

                if (response.ok) {
                    console.log('Buddy request sent successfully');
                    setBuddyStatus('sent');
                }
            } else if (buddyStatus === 'received') {
                // Accept buddy request
                console.log('Accepting buddy request...');
                const response = await fetch('http://localhost:5001/api/users/accept-buddy-request', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fromUser: matchId })
                });

                if (response.ok) {
                    console.log('Buddy request accepted successfully');
                    setBuddyStatus('connected');
                }
            }
        } catch (error) {
            console.error('Error handling buddy action:', error);
        }
    };

    const renderBuddyButton = () => {
        switch (buddyStatus) {
            case 'none':
                return (
                    <button onClick={handleBuddyAction} className="connect-button">
                        Connect
                    </button>
                );
            case 'sent':
                return (
                    <button disabled className="sent-button">
                        Sent
                    </button>
                );
            case 'received':
                return (
                    <button onClick={handleBuddyAction} className="approve-button">
                        Approve
                    </button>
                );
            case 'connected':
                return (
                    <button disabled className="buddies-button">
                        Buddies
                    </button>
                );
            default:
                return null;
        }
    };

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Header/>
            <Navbar/>
            
                <BuddyProfileSection />
            
            <Messages/>
        </div>
    );
}

export default BuddyProfile;