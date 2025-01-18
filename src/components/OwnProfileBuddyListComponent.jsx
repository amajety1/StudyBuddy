import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function OwnProfileBuddyListComponent() {
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    // Log the updated user state only when it changes
    useEffect(() => {
        console.log("Updated user variable: ", user);
    }, [user]);

    useEffect(() => {
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

        fetchUserData();
    }, []);

    const handleBuddyClick = (buddyId) => {
        navigate(`/buddy/${buddyId}`);
    };

    return (
        <div className="buddy-list-container">
            <h3>My Study Buddies</h3>
            {user.buddies && user.buddies.length > 0 ? (
                <ul>
                    {user.buddies.map((buddy) => (
                        <li 
                            key={buddy._id || `${buddy.firstName}-${buddy.lastName}`} 
                            onClick={() => handleBuddyClick(buddy._id)}
                        >
                            <img 
                                src={buddy.profilePicture || 'http://localhost:5001/images/empty-profile-pic.png'} 
                                alt={`${buddy.firstName}'s profile`} 
                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div className="buddy-info">
                                <span className="buddy-name">{buddy.firstName} {buddy.lastName}</span>
                                <span className="buddy-details">{buddy.major} • {buddy.degreeType}</span>
                                {buddy.bio && <span className="buddy-details">{buddy.bio}</span>}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="no-buddies">
                    <p>No buddies found.</p>
                </div>
            )}
        </div>
    );
}

export default OwnProfileBuddyListComponent;
