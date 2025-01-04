import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Matches from "./Matches";
import ProjectCard from "./ProjectCard";

function BuddyProfileSection() {
    const { matchId } = useParams();
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        selectedCourses: [],
        major: "",
        degreeType: "",
        github: "",
        projects: [],
        bio: "",
        previousCourses: [],
        profilePicture: null,
        availableSessions: []
    });
    const [buddyStatus, setBuddyStatus] = useState('none');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    // Fetch buddy data and determine status
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("[BuddyProfile] Starting to fetch data for matchId:", matchId);
                setIsLoading(true);
                
                // Fetch buddy's data
                console.log("[BuddyProfile] Fetching buddy data...");
                const buddyResponse = await fetch(`http://localhost:5001/api/users/profile/${matchId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!buddyResponse.ok) {
                    console.log("[BuddyProfile] Failed to fetch buddy data:", buddyResponse.status);
                    throw new Error('Failed to fetch buddy data');
                }

                const buddyData = await buddyResponse.json();
                console.log("[BuddyProfile] Received buddy data:", buddyData);
                setUser(buddyData);

                // Fetch current user's data to determine buddy status
                console.log("[BuddyProfile] Fetching current user data...");
                const currentUserResponse = await fetch('http://localhost:5001/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!currentUserResponse.ok) {
                    console.log("[BuddyProfile] Failed to fetch current user data:", currentUserResponse.status);
                    throw new Error('Failed to fetch current user data');
                }

                const currentUserData = await currentUserResponse.json();
                console.log("[BuddyProfile] Current user data received");

                // Determine buddy status
                let status = 'none';
                if (currentUserData.buddies?.includes(matchId)) {
                    status = 'connected';
                } else if (currentUserData.outgoingBuddyRequests?.includes(matchId)) {
                    status = 'sent';
                } else if (currentUserData.incomingBuddyRequests?.includes(matchId)) {
                    status = 'received';
                }
                console.log("[BuddyProfile] Determined buddy status:", status);
                setBuddyStatus(status);

                setIsLoading(false);
            } catch (err) {
                console.error('[BuddyProfile] Error:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        if (matchId && token) {
            console.log("[BuddyProfile] Starting data fetch with matchId:", matchId);
            fetchData();
        } else {
            console.log("[BuddyProfile] Missing required data:", { matchId, hasToken: !!token });
            setIsLoading(false);
            setError('Missing required data');
        }
    }, [matchId, token]);

    const handleBuddyAction = async () => {
        try {
            console.log("[BuddyProfile] Handling buddy action. Current status:", buddyStatus);
            if (buddyStatus === 'none') {
                console.log("[BuddyProfile] Sending buddy request...");
                const response = await fetch('http://localhost:5001/api/users/send-buddy-request', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ matchId })
                });

                if (response.ok) {
                    console.log("[BuddyProfile] Buddy request sent successfully");
                    setBuddyStatus('sent');
                } else {
                    console.log("[BuddyProfile] Failed to send buddy request:", response.status);
                    throw new Error('Failed to send buddy request');
                }
            } else if (buddyStatus === 'received') {
                console.log("[BuddyProfile] Accepting buddy request...");
                const response = await fetch('http://localhost:5001/api/users/accept-buddy-request', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fromUser: matchId })
                });

                if (response.ok) {
                    console.log("[BuddyProfile] Buddy request accepted successfully");
                    setBuddyStatus('connected');
                } else {
                    console.log("[BuddyProfile] Failed to accept buddy request:", response.status);
                    throw new Error('Failed to accept buddy request');
                }
            }
        } catch (err) {
            console.error('[BuddyProfile] Error in buddy action:', err);
            setError(err.message);
        }
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

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
                        Request Sent
                    </button>
                );
            case 'received':
                return (
                    <button onClick={handleBuddyAction} className="approve-button">
                        Accept Request
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

    return (
        <div className="buddy-profile">
            <div className="buddy-profile-name-github-courses-left-half">
                <img 
                    className="own-profile-image"
                    src={user.profilePicture || "/images/default-profile.jpeg"}
                    alt={`${user.firstName}'s profile`}
                />

                <div className="buddy-profile-name-backdrop-connect">
                    <div className="profile-backdrop">
                        <img src="/images/profile-backdrop-img.jpg" alt="Profile backdrop" />
                    </div>
                    <div className="buddy-profile-links">
                        {user.github && (
                            <a
                                href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src="/images/github-icon.png" alt="GitHub" />
                            </a>
                        )}
                        {renderBuddyButton()}
                    </div>
                    <div className="buddy-profile-name-brief-about-major-degree">
                        <div className="buddy-profile-brief-name">
                            <h3 className="noto-sans">{user.firstName} {user.lastName}</h3>
                            <p className="noto-sans">{user.bio}</p>
                        </div>
                        <div className="buddy-profile-brief-edu">
                            <h3 className="noto-sans">{user.major}</h3>
                            <p className="noto-sans">{user.degreeType}</p>
                            <div className="buddy-profile-line"></div>
                        </div>
                    </div>
                </div>

                <div className="buddy-profile-about-github">
                    <h3>About</h3>
                    <p>{user.bio || 'No bio available'}</p>
                    <div className="buddy-profile-line"></div>
                </div>

                <div className="buddy-profile-courses">
                    <h3 className="noto-sans">Courses</h3>
                    <div className="buddy-profile-current-course-and-label">
                        <h5 className="noto-sans">Current Courses</h5>
                        <div className="buddy-profile-current-courses">
                            {user.selectedCourses.map((course, index) => (
                                <div key={index} className="buddy-profile-current-course-card">
                                    {course}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="buddy-profile-previous-course-and-label">
                        <h5 className="noto-sans">Previous Courses</h5>
                        <div className="buddy-profile-previous-courses">
                            {user.previousCourses?.map((course, index) => (
                                <div key={index} className="buddy-profile-previous-course-card">
                                    {course}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="buddy-profile-book-study-session">
                    <h3 className="noto-sans">Book Study Session</h3>
                    <h4 className="noto-sans">Available sessions</h4>
                    <div className="study-session-cards">
                        {user.availableSessions?.map((session, index) => (
                            <div key={index} className="buddy-profile-session-card">
                                <h6 className="noto-sans">Day: {session.dayOfWeek}</h6>
                                <h6 className="noto-sans">Time: {session.time}</h6>
                                <h6 className="noto-sans">Location: {session.location}</h6>
                                <h6 className="noto-sans">Type: {session.sessionType}</h6>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="buddy-profile-projects">
                    <h3 className="noto-sans">Projects</h3>
                    <div className="buddy-profile-projects-cards">
                        {user.projects.map((project, index) => (
                            <ProjectCard
                                key={index}
                                name={project.name}
                                description={project.description}
                                techStack={project.techStack}
                                githubLink={project.githubLink}
                                readOnly={true}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="buddy-profile-buddy-suggestions-right-half">
                <Matches />
            </div>
        </div>
    );
}

export default BuddyProfileSection;