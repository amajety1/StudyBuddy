import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Matches.css"; // Import new CSS file

function Matches() {
    const [matches, setMatches] = useState([]);
    const [sentRequests, setSentRequests] = useState(new Set());
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMatches = async () => {
            if (!token) return;

            try {
                const response = await fetch("http://localhost:5001/api/users/fetch-recommended-matches", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error("Failed to fetch matches");

                const data = await response.json();
                setMatches(data.map((user) => ({
                    id: user._id,
                    fullName: `${user.firstName} ${user.lastName}`,
                    profilePic: user.profilePicture,
                    projects: user.projects || [] // Ensure projects array exists
                })));
            } catch (error) {
                console.error("Error fetching matches:", error);
            }
        };

        fetchMatches();
    }, [token]);

    const sendBuddyRequest = async (matchId) => {
        if (sentRequests.has(matchId)) return;

        try {
            const response = await fetch("http://localhost:5001/api/users/send-buddy-request", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ matchId }),
            });

            if (!response.ok) throw new Error("Failed to send buddy request");

            setSentRequests((prev) => new Set([...prev, matchId]));
        } catch (error) {
            console.error("Error sending buddy request:", error);
        }
    };

    return (
        <div className="matches-container">
            <h2 className="matches-title">Recommended Matches</h2>
            <div className="matches-list">
                {matches.map((match) => (
                    <div key={match.id} className="match-item">
                        <img
                            className="match-profile-pic"
                            src={match.profilePic}
                            alt={match.fullName}
                            onClick={() => navigate(`/buddy/${match.id}`)}
                        />
                        <div className="match-info">
                            <h4 
                                className="match-name clickable-name"
                                onClick={() => navigate(`/buddy/${match.id}`)}
                            >
                                {match.fullName}
                            </h4>

                            {/* Display Projects */}
                            {match.projects.length > 0 && (
                                <div className="match-projects">
                                    <h5>Projects:</h5>
                                    <ul>
                                        {match.projects.slice(0, 3).map((project, index) => (  // Show only 3 projects max
                                            <li key={index} className="project-item">
                                                {project.name} 
                                                {project.githubLink && (
                                                    <a 
                                                        href={project.githubLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
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

                            <button
                                className={`connect-btn ${sentRequests.has(match.id) ? "sent" : ""}`}
                                onClick={() => sendBuddyRequest(match.id)}
                                disabled={sentRequests.has(match.id)}
                            >
                                {sentRequests.has(match.id) ? "Request Sent" : "Connect"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Matches;
