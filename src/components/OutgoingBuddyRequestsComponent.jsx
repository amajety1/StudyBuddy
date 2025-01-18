import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function OutgoingBuddyRequestsComponent() {
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
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

    const cancelBuddyRequest = async (buddyId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("[Profile] No token found");
                return;
            }

            const response = await fetch('http://localhost:5001/api/users/cancel-buddy-request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ toUser: buddyId })
            });
            
            if (response.ok) {
                // Refresh the user data after successful cancellation
                await fetchUserData();
            } else {
                console.error('Failed to cancel buddy request:', response.status);
            }
        } catch (error) {
            console.error('Error canceling buddy request:', error);
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
            <h3>Outgoing Buddy Requests</h3>
            {user.outgoingBuddyRequests && user.outgoingBuddyRequests.length > 0 ? (
                <ul>
                    {user.outgoingBuddyRequests.map((buddy) => (
                        <li key={buddy._id}>
                            <img 
                                onClick={() => handleBuddyClick(buddy._id)}
                                src={buddy.profilePicture || 'http://localhost:5001/images/empty-profile-pic.png'} 
                                alt={`${buddy.firstName}'s profile`} 
                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                            />
                            <div className="buddy-info">
                                <span className="buddy-name-and-button">
                                    <span className="buddy-name">{buddy.firstName} {buddy.lastName}</span>
                                    <button 
                                        className="cancel-button"
                                        onClick={() => cancelBuddyRequest(buddy._id)}
                                    >
                                        Cancel
                                    </button>
                                </span>
                                <span className="buddy-details">{buddy.major} • {buddy.degreeType}</span>
                                {buddy.bio && <span className="buddy-details">{buddy.bio}</span>}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="no-buddies">
                    <p>No outgoing buddy requests at the moment.</p>
                </div>
            )}
        </div>
    );
}

export default OutgoingBuddyRequestsComponent;
