import React, { useState, useEffect } from "react";
import Matches from "./Matches";
import EditCourses from "./EditCourses";
import ProjectCard from "./ProjectCard";
import DaySchedule from "./DaySchedule";
import EditProjects from './EditProjects';

function OwnProfileSection() {
    const [user, setUser] = useState({
        firstName: "default",
        lastName: "default",
        selectedCourses: [],
        major: "default",
        degreeType: "default",
        github: "",
        projects: [],
        bio: "default",
        previousCourses: [],


    });
   
    const [isLoading, setIsLoading] = useState(false);

    const handleCurrentCoursesChange = (newCourses) => {
        setUser(prevUser => ({
            ...prevUser,
            selectedCourses: newCourses
        }));
    };

    const handlePreviousCoursesChange = (newCourses) => {
        setUser(prevUser => ({
            ...prevUser,
            previousCourses: newCourses
        }));
    };

    const handleProjectsUpdate = (updatedProjects) => {
        setUser(prevUser => ({
            ...prevUser,
            projects: updatedProjects
        }));
    };

    useEffect(() => {
        //console.log("Updated user variable: ", user);
    }, [user]);

    // Fetch user data including profile picture on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                //console.log("[Profile] Fetching user data...");
                const token = localStorage.getItem('token');
                //console.log("[Profile] Token:", token ? "Present" : "Missing");
                if (!token) {
                    //console.log("[Profile] No token found");
                    return;
                }

                //console.log("[Profile] Fetching user data...");
                const response = await fetch('http://localhost:5001/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    //////console.log("[Profile] User data received:", userData);
                    setUser(userData);
                    //console.log("The user variable: ", user);


                    // Update profile image URL
                    if (userData.profilePicture) {
                        //console.log("[Profile] Raw profile picture path:", userData.profilePicture);
                        

                    } else {
                        //console.log("[Profile] No profile picture in user data");
                        setUser((prevUser) => ({ ...prevUser, profilePicture: 'http://localhost:5001/images/empty-profile-pic.png' }));
                    }
                } else {
                    //console.log("[Profile] Failed to fetch user data:", response.status);
                    const errorText = await response.text();
                    //console.log("[Profile] Error details:", errorText);
                }
            } catch (error) {
                //console.error('[Profile] Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        //console.log("user.profilePicture state changed to:", user.profilePicture);
    }, [user.profilePicture]); // Log whenever profileImage changes

    const handleImageError = () => {
        //console.log("[Profile] Image failed to load, using default");
        setImageError(true);
        setUser((prevUser) => ({ ...prevUser, profilePicture: 'http://localhost:5001/images/empty-profile-pic.png' }));
    };

   

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        //console.log("[Profile] File selected:", file ? file.name : "No file");

        if (!file || !user) {
            //console.log("[Profile] Missing file or user:", { file: !!file, user: !!user });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            //console.log("[Profile] File too large:", file.size);
            alert("File size should not exceed 5MB");
            return;
        }

        try {
            setIsLoading(true);
            //console.log("[Profile] Starting file upload...");

            const formData = new FormData();
            formData.append('profilePicture', file);
            formData.append('userId', user.email);
            //console.log("[Profile] FormData created with userId:", user.email);

            const token = localStorage.getItem('token');
            //console.log("[Profile] Upload request starting...");
            const uploadResponse = await fetch('http://localhost:5001/api/users/upload-profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            //console.log("[Profile] Upload response status:", uploadResponse.status);
            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                //console.log("[Profile] Upload error details:", errorText);
                throw new Error('Failed to upload profile picture');
            }

            const responseData = await uploadResponse.json();
            //console.log("[Profile] Upload response data:", responseData);
            const { profilePicturePath } = responseData;

            // Make sure we have the full URL
            const fullPicturePath = profilePicturePath.startsWith('http')
                ? profilePicturePath
                : `http://localhost:5001${profilePicturePath}`;
            //console.log("[Profile] Full picture path:", fullPicturePath);

            // Update the profile image immediately

            setUser((prevUser) => ({ ...prevUser, profilePicture: fullPicturePath }));
            //console.log("[Profile] Profile image state updated");

            // Refresh user data
            //console.log("[Profile] Refreshing user data...");
            const userResponse = await fetch('http://localhost:5001/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                //console.log("[Profile] Refreshed user data:", userData);
                setUser(userData);
            } else {
                //console.log("[Profile] Failed to refresh user data:", userResponse.status);
                const errorText = await userResponse.text();
                //console.log("[Profile] Refresh error details:", errorText);
            }
        } catch (error) {
            //console.error("[Profile] Error updating profile picture:", error);
            alert("Failed to update profile picture. Please try again.");
        } finally {
            setIsLoading(false);
            //console.log("[Profile] Upload process completed");
        }
    };

    const triggerFileInput = () => {
        document.getElementById("profile-image-input").click();
    };

    const [tempGithubLink, setTempGithubLink] = useState(user.github);



    const [newProject, setNewProject] = useState({
        title: "",
        link: "",
        description: ""
    });
    function addProject() {
        if (newProject.title.trim()) {
            setUser((prevUser) => ({ ...prevUser, projects: [...prevUser.projects, { ...newProject }] }));
            setNewProject({ title: "", link: "", description: "" });

        }
    }


    const allCourses = [
        "CSC 1301",
        "CSC 1302",
        "CSC 4351",
        "CSC 2301",
        "CSC 2302",
        "CSC 3351",
        // ... add more courses here
    ];
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredEdit, setIsHoveredEdit] = useState(false);
    const [isEditWindowOpen, setIsEditWindowOpen] = useState(false);
    const [userBio, setUserBio] = useState("Data Science Enthusiast");
    const [currentUserBio, setCurrentUserBio] = useState("");
    const [currentUserAbout, setCurrentUserAbout] = useState("");


    useEffect(() => {
        if (isEditWindowOpen) {
            document.body.style.overflow = "hidden"; // Disable scrolling
        } else {
            document.body.style.overflow = ""; // Enable scrolling
        }

        return () => {
            document.body.style.overflow = ""; // Cleanup on unmount
        };
    }, [isEditWindowOpen]);

    return (
        <div className="buddy-profile">
            <div className="edit-profile-window" style={{ display: isEditWindowOpen ? "block" : "none" }}>
                <div className="edit-profile-window-overlay"></div>
                <div className="edit-profile-window-content">
                    <div className="title-and-close">
                        <h3 className="noto-sans">Edit Profile</h3>
                        <img onClick={() => setIsEditWindowOpen(false)} src="/images/close-arrow.png"></img>
                    </div>

                    <div className="edit-bio">
                        <h4 className="noto-sans">Edit Bio</h4>
                        <textarea
                            value={currentUserBio || userBio}
                            onChange={(e) => setCurrentUserBio(e.target.value)}
                            placeholder="Bio"
                        />
                    </div>

                    <div className="edit-github-link">
                        <h4 className="noto-sans">Edit GitHub Link</h4>
                        <input
                            type="text"
                            placeholder="GitHub Link"
                            value={tempGithubLink || user.github || ''}
                            onChange={(e) => {
                                setTempGithubLink(e.target.value);
                                setUser(prevUser => ({
                                    ...prevUser,
                                    github: e.target.value
                                }));
                            }}
                            className="github-input"
                        />
                        <p>Current GitHub Link: {user.github || 'Not set'}</p>
                    </div>

                    <div className="edit-about">
                        <h4 className="noto-sans">Edit About</h4>
                        <textarea
                            value={currentUserAbout || user.about}
                            onChange={(e) => setCurrentUserAbout(e.target.value)}
                            placeholder="About"
                        />
                    </div>

                    <EditCourses
                        allCourses={allCourses}
                        title="Edit Current Courses"
                        initialCourses={user.selectedCourses}
                        onCoursesChange={handleCurrentCoursesChange}
                    />
                    <EditCourses
                        allCourses={allCourses}
                        title="Edit Previous Courses"
                        initialCourses={user.previousCourses}
                        onCoursesChange={handlePreviousCoursesChange}
                    />

                    <EditProjects
                        projects={user.projects || []}
                        onUpdate={handleProjectsUpdate}
                    />

                    <div className="edit-times-available">
                        <h4 className="noto-sans">Edit Available Sessions</h4>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                            // Get sessions for this day
                            const daySessions = user.availableSessions?.filter(
                                session => session.dayOfWeek === day
                            ) || [];

                            // Convert sessions to format expected by DaySchedule
                            const formattedSessions = daySessions.map(session => {
                                const [start, end] = session.time.split(' - ');
                                return {
                                    start,
                                    end,
                                    location: session.location,
                                    sessionType: session.sessionType
                                };
                            });

                            return (
                                <DaySchedule
                                    key={day}
                                    day={day}
                                    sessions={formattedSessions}
                                    onUpdate={(updatedDay, updatedSessions) => {
                                        // Convert back to the format stored in user
                                        const newSessions = updatedSessions.map(session => ({
                                            dayOfWeek: day,
                                            time: `${session.start} - ${session.end}`,
                                            location: session.location,
                                            sessionType: session.sessionType
                                        }));

                                        setUser(prevUser => {
                                            // Remove all sessions for this day
                                            const otherDaySessions = prevUser.availableSessions?.filter(
                                                session => session.dayOfWeek !== day
                                            ) || [];

                                            // Add the updated sessions
                                            return {
                                                ...prevUser,
                                                availableSessions: [...otherDaySessions, ...newSessions]
                                            };
                                        });
                                    }}
                                />
                            );
                        })}
                    </div>

                    <div className="save-all-changes">
                        <button
                            className="save-all-button"
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('token');
                                    if (!token) {
                                        alert('You are not logged in. Please log in and try again.');
                                        return;
                                    }

                                    // Prepare the updated user data
                                    const updatedUserData = {
                                        ...user,
                                        bio: currentUserBio || user.bio,
                                        about: currentUserAbout || user.about,
                                        github: tempGithubLink || user.github
                                    };

                                    //console.log('Sending updated user data:', updatedUserData);

                                    const response = await fetch('http://localhost:5001/api/users/update-profile', {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`,
                                        },
                                        body: JSON.stringify(updatedUserData),
                                    });

                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        throw new Error(errorData.error || 'Failed to update profile');
                                    }

                                    const updatedUser = await response.json();
                                    //console.log('Server response:', updatedUser);

                                    // Update local state with server's response
                                    setUser(updatedUser);
                                    
                                    // Reset temporary states
                                    setCurrentUserBio("");
                                    setCurrentUserAbout("");
                                    setTempGithubLink("");
                                    
                                    alert('Changes saved successfully!');
                                    setIsEditWindowOpen(false);
                                } catch (error) {
                                    //console.error('Error saving changes:', error);
                                    alert('Failed to save changes: ' + error.message);
                                }
                            }}
                        >
                            Save All Changes
                        </button>
                    </div>
                </div>
            </div>
            <div className="buddy-profile-name-github-courses-left-half">

                <img
                    onClick={triggerFileInput}
                    onMouseEnter={() => setIsHoveredEdit(true)}
                    onMouseLeave={() => setIsHoveredEdit(false)}
                    style={{
                        display: (isHovered || isHoveredEdit) ? "block" : "none",
                        opacity: isLoading ? 0.5 : 1
                    }}
                    className="edit-profile-pic"
                    src="/images/edit.png"
                    alt="Edit"
                />
                <img
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={!isLoading ? triggerFileInput : undefined}
                    style={{
                        filter: isHovered || isHoveredEdit ? "brightness(0.75)" : "brightness(1)",
                        cursor: isLoading ? "wait" : "pointer",
                        opacity: isLoading ? 0.7 : 1
                    }}
                    className="own-profile-image"
                    src={user.profilePicture}
                    alt="Profile"
                    onError={handleImageError}
                />
                {/* Hidden File Input */}
                <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    disabled={isLoading}
                />

                <div className="buddy-profile-name-backdrop-connect">
                    <div className="profile-backdrop">
                        <img src="/images/profile-backdrop-img.jpg"></img>
                    </div>
                    <div className="buddy-profile-links">
                        <a
                            href={
                                user?.github
                                    ? user.github.startsWith("http")
                                        ? user.github
                                        : `https://${user.github}`
                                    : "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src="/images/github-icon.png" alt="GitHub Link" />
                        </a>


                        <div className="edit-icon-name-about-profile"><img onClick={() => setIsEditWindowOpen(true)} src="/images/edit.png"></img></div>
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
                    <p>{user.about}</p>
                    <div className="buddy-profile-line"></div>
                </div>
                <div className="buddy-profile-courses">
                    <h3 className="noto-sans">Courses</h3>
                    <div className="buddy-profile-current-course-and-label">
                        <h5 className="noto-sans">Current Courses</h5>
                        <div className="buddy-profile-current-courses">
                            {user.selectedCourses.map((course, index) => (
                                <div key={index} className="buddy-profile-current-course-card">{course}</div>
                            ))}
                        </div>
                    </div>
                    <div className="buddy-profile-previous-course-and-label">
                        <h5 className="noto-sans">Previous Courses</h5>
                        <div className="buddy-profile-previous-courses">

                            {user.previousCourses?.map((course, index) => (
                                <div key={index} className="buddy-profile-previous-course-card">{course}</div>
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
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="buddy-profile-buddy-suggestions-right-half">
                <Matches />
            </div>

        </div>
    )
}

export default OwnProfileSection;