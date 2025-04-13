import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Matches.css';

function Matches() {
    const [matches, setMatches] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [sentRequests, setSentRequests] = useState(new Set());
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const BASE_URL = 'http://localhost:5001';

    // Default image fallback
    const getDefaultImage = (type) => {
        return type === 'group' ? '/images/default-group.svg' : '/images/default-profile.jpg';
    };

    // Construct valid profile image URL or return a DiceBear-generated avatar
    const getImageUrl = (profilePicture, type, userId) => {
        if (!profilePicture || profilePicture === 'null') {
            // Return a fun random avatar
            return `https://api.dicebear.com/7.x/adventurer/png?seed=${userId}`;
        }

        if (profilePicture.startsWith('http')) return profilePicture;

        const filename = profilePicture.split('/').pop();
        return `${BASE_URL}/api/images/${filename}`;
    };

    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (!token) return;

            try {
                const response = await fetch(`${BASE_URL}/api/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch current user');

                const userData = await response.json();
                setCurrentUserId(userData._id);
                setCurrentUserData(userData);
                if (userData.outgoingBuddyRequests) {
                    setSentRequests(new Set(userData.outgoingBuddyRequests));
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchCurrentUser();
    }, [token]);

    useEffect(() => {
        const fetchMatches = async () => {
            if (!token) return;

            try {
                const response = await fetch(`${BASE_URL}/api/users/fetch-recommended-matches`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch matches');

                const data = await response.json();
                setMatches(data.map(user => ({
                    id: user._id,
                    fullName: `${user.firstName} ${user.lastName}`,
                    profilePic: user.profilePicture,
                    projects: user.projects || []
                })));
            } catch (error) {
                console.error('Error fetching matches:', error);
            }
        };

        fetchMatches();
    }, [token]);

    const sendBuddyRequest = async (matchId) => {
        if (!currentUserId) {
            alert('You must be logged in to send buddy requests');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/users/send-buddy-request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ matchId })
            });

            const data = await response.json();

            if (response.ok) {
                setSentRequests(prev => new Set([...prev, matchId]));
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

    return (
        <div className="matches-title-and-buddies">
            <h2>Recommended Matches</h2>
            <div className="matched-buddies">
                {matches.map(match => (
                    <div key={match.id} className="matched-buddy">
                        <img
                            className="matched-buddy-image"
                            src={getImageUrl(match.profilePic, 'user', match.id)}
                            alt={`${match.fullName}'s profile`}
                            onClick={() => navigate(`/buddy/${match.id}`)}
                            style={{ cursor: 'pointer' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://api.dicebear.com/7.x/adventurer/png?seed=${match.id}`;
                            }}
                        />
                        <div className="matched-buddy-info">
                            <h4 className="noto-sans clickable-name" onClick={() => navigate(`/buddy/${match.id}`)}>
                                {match.fullName}
                            </h4>

                            {match.projects.length > 0 && (
                                <div className="match-projects">
                                    <h5>Projects:</h5>
                                    <ul>
                                        {match.projects.slice(0, 3).map((project, index) => (
                                            <li key={index} className="project-item">
                                                {project.name}
                                                {project.githubLink && (
                                                    <a
                                                        href={project.githubLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="github-link"
                                                    >
                                                        🔗
                                                    </a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    {match.projects.length > 3 && <p className="view-more">View more...</p>}
                                </div>
                            )}

                            <div
                                className={`buddy-up-button noto-sans ${sentRequests.has(match.id) ? 'sent' : ''}`}
                                onClick={() => !sentRequests.has(match.id) && sendBuddyRequest(match.id)}
                                style={{ cursor: sentRequests.has(match.id) ? 'not-allowed' : 'pointer' }}
                            >
                                {sentRequests.has(match.id) ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="sent-icon">
                                            <path d="M22.164 2.849a1.5 1.5 0 00-1.715-.145L2.689 13.141a1.5 1.5 0 00.2 2.702l5.77 1.872 1.871 5.77a1.5 1.5 0 002.702.2l10.437-17.76a1.5 1.5 0 00-.505-2.077zm-7.186 9.057L9.53 14.349 5.744 12.98l11.406-6.954-2.172 5.88zm-1.38 6.175l-1.37-4.225 5.88-2.172-4.51 6.397z" />
                                        </svg>
                                        <p>Sent</p>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="plus-icon">
                                            <path d="M12 4.5a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6A.75.75 0 0112 4.5z" />
                                        </svg>
                                        <p>Connect</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Matches;
