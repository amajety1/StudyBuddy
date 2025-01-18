import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function IncomingBuddyRequestsComponent() {
    const [user, setUser] = useState({});
    const [acceptedBuddies, setAcceptedBuddies] = useState(new Set());
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchUserData = async () => {
        try {
            if (!token) {
                console.log("[Profile] No token found");
                return;
            }

            const response = await fetch('http://localhost:5001/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                console.error("[Profile] Failed to fetch user data:", response.status);
            }
        } catch (error) {
            console.error('[Profile] Error fetching user data:', error);
        }
    };

    const acceptBuddyRequest = async (buddyId) => {
        try {
            const response = await fetch('http://localhost:5001/api/users/accept-buddy-request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fromUser: buddyId })
            });
            
            if (response.ok) {
                setAcceptedBuddies(prev => new Set([...prev, buddyId]));
                await fetchUserData(); // Refresh user data
            }
        } catch (error) {
            console.error('Error accepting buddy request:', error);
        }
    };

    const rejectBuddyRequest = async (buddyId) => {
        try {
            const response = await fetch('http://localhost:5001/api/users/reject-buddy-request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fromUser: buddyId })
            });
            
            if (response.ok) {
                await fetchUserData(); // Refresh user data
            }
        } catch (error) {
            console.error('Error rejecting buddy request:', error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleBuddyClick = (buddyId) => {
        navigate(`/buddy/${buddyId}`);
    };

    return (
        <div className="buddy-list-container">
            <h3>Incoming Buddy Requests</h3>
            {user.incomingBuddyRequests && user.incomingBuddyRequests.length > 0 ? (
                <ul>
                    {user.incomingBuddyRequests.map((buddy) => (
                        <li 
                            key={buddy._id} 
                            onClick={() => handleBuddyClick(buddy._id)}
                        >
                            <img 
                                src={buddy.profilePicture || 'http://localhost:5001/images/empty-profile-pic.png'} 
                                alt={`${buddy.firstName}'s profile`} 
                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div className="buddy-info">
                                <span className="incoming-buddy-name-and-button">
                                    <span className="buddy-name">{buddy.firstName} {buddy.lastName}</span> 
                                    {acceptedBuddies.has(buddy._id) ? (
                                        <span className="buddy-status">Buddies</span>
                                    ) : (
                                        <>
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                acceptBuddyRequest(buddy._id);
                                            }}>Accept</button>
                                            <button 
                                                style={{ marginLeft: '10px', background: 'red'}} 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    rejectBuddyRequest(buddy._id);
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </span>
                                <span className="buddy-details">{buddy.major} • {buddy.degreeType}</span>
                                {buddy.bio && <span className="buddy-details">{buddy.bio}</span>}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="no-buddies">
                    <p>No incoming buddy requests at the moment.</p>
                </div>
            )}
        </div>
    );
}

export default IncomingBuddyRequestsComponent;
