import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';

function BuddyProfileBuddyListComponent() {
    const [buddy, setBuddy] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const { matchId } = useParams();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log("[BuddyProfile] No token found");
                    return;
                }

                console.log("Making request to:", 'http://localhost:5001/api/users/me');
                const response = await fetch('http://localhost:5001/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    const errorData = await response.text();
                    console.error("[BuddyProfile] Failed to fetch user data:", response.status, errorData);
                }
            } catch (error) {
                console.error('[BuddyProfile] Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchBuddyData = async () => {
            console.log("Fetching buddy data with matchId:", matchId);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log("[BuddyProfile] No token found");
                    return;
                }

                console.log("Making request to:", `http://localhost:5001/api/users/${matchId}`);
                const response = await fetch(`http://localhost:5001/api/users/${matchId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log("Response status:", response.status);
                if (response.ok) {
                    const buddyData = await response.json();
                    console.log("Received buddy data:", buddyData);
                    setBuddy(buddyData);
                } else {
                    const errorData = await response.text();
                    console.error("[BuddyProfile] Failed to fetch buddy data:", response.status, errorData);
                }
            } catch (error) {
                console.error('[BuddyProfile] Error fetching buddy data:', error);
            }
        };

        if (matchId) {
            fetchBuddyData();
        } else {
            console.log("No matchId available");
        }
    }, [matchId]);

    const handleBuddyClick = (buddyId) => {
        navigate(`/buddy/${buddyId}`);
    };

    if (!buddy) {
        return <div className="buddy-list-container">Loading...</div>;
    }

    return (
        <div className="buddy-list-container">
            <h3>{user._id === matchId ? 'Your' : buddy.firstName}'s Study Buddies</h3>
            {buddy.buddies && buddy.buddies.length > 0 ? (
                <ul>
                    {buddy.buddies.map((buddyItem) => (
                        <li 
                            key={buddyItem._id} 
                            onClick={() => handleBuddyClick(buddyItem._id)}
                        >
                            <img 
                                src={buddyItem.profilePicture || 'http://localhost:5001/images/empty-profile-pic.png'} 
                                alt={`${buddyItem.firstName}'s profile`} 
                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div className="buddy-info">
                                <span className="buddy-name">{buddyItem.firstName} {buddyItem.lastName}</span>
                                <span className="buddy-details">{buddyItem.major} • {buddyItem.degreeType}</span>
                                {buddyItem.bio && <span className="buddy-details">{buddyItem.bio}</span>}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="no-buddies">
                    <p>{buddy.firstName} hasn't connected with any study buddies yet!</p>
                </div>
            )}
        </div>
    );
}

export default BuddyProfileBuddyListComponent;
