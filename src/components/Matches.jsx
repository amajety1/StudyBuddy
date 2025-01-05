import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Matches() {
    const [matches, setMatches] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [sentRequests, setSentRequests] = useState(new Set());
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const notifyMatchOfRequest = async (matchId) => {
        try {
            const response = await fetch('http://localhost:5001/api/users/notify-match-of-request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    matchId: matchId
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Notification sent successfully');
            } else {
                throw new Error(data.error || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            alert(error.message || 'An error occurred. Please try again.');
        }

       }

   

    useEffect(() => {
        // Fetch current user's ID
        const fetchCurrentUser = async () => {
            if (!token) return;

            try {
                const response = await fetch('http://localhost:5001/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch current user');
                }

                const userData = await response.json();
                setCurrentUserId(userData._id);
                setCurrentUserData(userData);
                // Initialize sent requests from user data
                if (userData.outgoingBuddyRequests) {
                    setSentRequests(new Set(userData.outgoingBuddyRequests));
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchCurrentUser();
    }, [token]);

    // Function to handle sending a buddy request
    const sendBuddyRequest = async (matchId) => {
        if (!currentUserId) {
            alert('You must be logged in to send buddy requests');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/users/send-buddy-request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    matchId: matchId
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local state to show sent status
                setSentRequests(prev => new Set([...prev, matchId]));
                // Update current user data
                setCurrentUserData(prev => ({
                    ...prev,
                    outgoingBuddyRequests: [...(prev.outgoingBuddyRequests || []), matchId]
                }));
            } else {
                throw new Error(data.error || 'Failed to send buddy request');
            }
        } catch (error) {
            console.error('Error sending buddy request:', error);
            alert(error.message || 'An error occurred. Please try again.');
        }
    };

    useEffect(() => {
        const fetchMatches = async () => {
            if (!token) {
                console.error('No token found');
                return;
            }

            try {
                const response = await fetch('http://localhost:5001/api/users/fetch-recommended-matches', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch matches');
                }

                const data = await response.json();
                setMatches(data.map(buddy => ({
                    id: buddy._id,
                    fullName: `${buddy.firstName} ${buddy.lastName}`,
                    profilePic: buddy.profilePicture
                })));
            } catch (error) {
                console.error('Error fetching matches:', error);
            }
        };

        fetchMatches();
    }, [token]);

    const navigateToProfile = (matchId) => {
        console.log('Navigating to profile with ID:', matchId);
        navigate(`/buddy/${matchId}`);
    };

    const renderBuddyButton = (matchId) => {
        const isRequestSent = sentRequests.has(matchId);

        if (isRequestSent) {
            return (
                <div className="buddy-up-button noto-sans">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="sent-icon">
                        <path d="M22.164 2.849a1.5 1.5 0 00-1.715-.145L2.689 13.141a1.5 1.5 0 00.2 2.702l5.77 1.872 1.871 5.77a1.5 1.5 0 002.702.2l10.437-17.76a1.5 1.5 0 00-.505-2.077zm-7.186 9.057L9.53 14.349 5.744 12.98l11.406-6.954-2.172 5.88zm-1.38 6.175l-1.37-4.225 5.88-2.172-4.51 6.397z" />
                    </svg>
                    <p>Sent</p>
                </div>
            );
        }

        return (
            <div
                className="buddy-up-button noto-sans"
                onClick={() => {sendBuddyRequest(matchId); notifyMatchOfRequest(matchId)}}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="plus-icon">
                    <path d="M12 4.5a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6A.75.75 0 0112 4.5z" />
                </svg>
                <p>Connect</p>
            </div>
        );
    };

    return (
        <div className='matches-title-and-buddies'>
            <h2>Recommended Matches</h2>
            <div className='matched-buddies'>
                {matches.map((match) => (
                    <div key={match.id} className='matched-buddy'>
                        <img 
                            className='matched-buddy-image' 
                            src={match.profilePic} 
                            alt={`${match.fullName}'s profile`}
                            onClick={() => {navigateToProfile(match.id)}}
                            style={{ cursor: 'pointer' }}
                        />
                        <div className='matched-buddy-info'>
                            <h4 className="noto-sans">{match.fullName}</h4>
                            {renderBuddyButton(match.id)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Matches;
