import React, { useState, useEffect } from "react";
import Matches from "./Matches";
import EditCourses from "./EditCourses";
import ProjectCard from "./ProjectCard";
import DaySchedule from "./DaySchedule";

function OwnProfileSection() {
    const [user, setUser] = useState({
        firstName: "default",
        lastName: "default",
        selectedCourses: [],
        major: "default",
        degreeType: "default",
        githubLink: "default",
        projects: [],
        bio: "default"

    });
    const [profileImage, setProfileImage] = useState('http://localhost:5001/images/default-profile.jpeg');
    const [isLoading, setIsLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [firstName, setFirstName] = useState("default");
    const [lastName, setLastName] = useState("default");


    useEffect(() => {
        console.log("Updated user variable: ", user);
    }, [user]);
    
    // Fetch user data including profile picture on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log("[Profile] Token:", token ? "Present" : "Missing");
                if (!token) {
                    console.log("[Profile] No token found");
                    return;
                }

                console.log("[Profile] Fetching user data...");
                const response = await fetch('http://localhost:5001/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    console.log("[Profile] User data received:", userData);
                    setUser({
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        selectedCourses: userData.selectedCourses,
                        major: userData.major,
                        degreeType: userData.degreeType,
                        githubLink: userData.githubLink,
                        bio: userData.bio,
                        about: userData.about,
                        projects: userData.projects,
                        availableSessions: userData.availableSessions
                    });
                    console.log("user variable: ", user);
                    
                    
                    // Update profile image URL
                    if (userData.profilePicture) {
                        console.log("[Profile] Raw profile picture path:", userData.profilePicture);
                        setImageError(false); // Reset error state
                        setProfileImage(userData.profilePicture);
                    } else {
                        console.log("[Profile] No profile picture in user data");
                        setProfileImage('http://localhost:5001/images/default-profile.jpeg');
                    }
                } else {
                    console.log("[Profile] Failed to fetch user data:", response.status);
                    const errorText = await response.text();
                    console.log("[Profile] Error details:", errorText);
                }
            } catch (error) {
                console.error('[Profile] Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        console.log("profileImage state changed to:", profileImage);
    }, [profileImage]); // Log whenever profileImage changes

    const handleImageError = () => {
        console.log("[Profile] Image failed to load, using default");
        setImageError(true);
        setProfileImage('http://localhost:5001/images/default-profile.jpeg');
    };

    const handleUpdate = (day, updatedTimes) => {
        setAvailableTimes((prev) => ({
          ...prev,
          [day]: updatedTimes,
        }));
      };

      const handleFileChange = async (e) => {
        const file = e.target.files[0];
        console.log("[Profile] File selected:", file ? file.name : "No file");
        
        if (!file || !user) {
            console.log("[Profile] Missing file or user:", { file: !!file, user: !!user });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            console.log("[Profile] File too large:", file.size);
            alert("File size should not exceed 5MB");
            return;
        }

        try {
            setIsLoading(true);
            console.log("[Profile] Starting file upload...");

            const formData = new FormData();
            formData.append('profilePicture', file);
            formData.append('userId', user.email);
            console.log("[Profile] FormData created with userId:", user.email);

            const token = localStorage.getItem('token');
            console.log("[Profile] Upload request starting...");
            const uploadResponse = await fetch('http://localhost:5001/api/users/upload-profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            console.log("[Profile] Upload response status:", uploadResponse.status);
            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.log("[Profile] Upload error details:", errorText);
                throw new Error('Failed to upload profile picture');
            }

            const responseData = await uploadResponse.json();
            console.log("[Profile] Upload response data:", responseData);
            const { profilePicturePath } = responseData;

            // Make sure we have the full URL
            const fullPicturePath = profilePicturePath.startsWith('http') 
                ? profilePicturePath 
                : `http://localhost:5001${profilePicturePath}`;
            console.log("[Profile] Full picture path:", fullPicturePath);

            // Update the profile image immediately
            setProfileImage(fullPicturePath);
            console.log("[Profile] Profile image state updated");

            // Refresh user data
            console.log("[Profile] Refreshing user data...");
            const userResponse = await fetch('http://localhost:5001/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log("[Profile] Refreshed user data:", userData);
                setUser(userData);
            } else {
                console.log("[Profile] Failed to refresh user data:", userResponse.status);
                const errorText = await userResponse.text();
                console.log("[Profile] Refresh error details:", errorText);
            }
        } catch (error) {
            console.error("[Profile] Error updating profile picture:", error);
            alert("Failed to update profile picture. Please try again.");
        } finally {
            setIsLoading(false);
            console.log("[Profile] Upload process completed");
        }
    };

    const triggerFileInput = () => {
        document.getElementById("profile-image-input").click();
    };

    const [githubLink, setGithubLink] = useState("github.com");
    const [tempGithubLink, setTempGithubLink] = useState(githubLink);

    const [availableTimes, setAvailableTimes] = useState({
      monday: [
        { start: '10:00', end: '11:00' },
        { start: '12:00', end: '13:00' },
        { start: '14:00', end: '15:00' }
      ],
      tuesday: [
        { start: '10:00', end: '11:00' },
        { start: '12:00', end: '13:00' },
        { start: '14:00', end: '15:00' }
      ],
      wednesday: [
        { start: '10:00', end: '11:00' },
        { start: '12:00', end: '13:00' },
        { start: '14:00', end: '15:00' }
      ],
      thursday: [
        { start: '10:00', end: '11:00' },
        { start: '12:00', end: '13:00' },
        { start: '14:00', end: '15:00' }
      ],
      friday: [
        { start: '10:00', end: '11:00' },
        { start: '12:00', end: '13:00' },
        { start: '14:00', end: '15:00' }
      ]
    });

    const [newProject, setNewProject] = useState({
        title: "",
        link: "",
        description: ""
      });
      function addProject() {
        if (newProject.title.trim()) {
          setProjects([...projects, { ...newProject }]);
          setNewProject({ title: "", link: "",description: ""  });
        }
      }

    const [projects, setProjects] = useState([
        {
          title: "Pilot Project",
          link: "https://github.com",
          description:
            "Pilot tracking app"
        },
        {
          title: "Dieting App",
          link: "https://github.com",
          description:
            "Dieting scanner"
        },
        {
          title: "Fitness scanner",
          link: "https://github.com",
          description:
            "Weight loss"
        },
      ]);
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
    const [courses, setCourses] = useState(["CSC 3350", "CSC 2720", "CSC 4351"]);
    const [currentFilteredCourses, setCurrentFilteredCourses] = useState([]);
    // const [prevFilteredCourses, setPrevFilteredCourses] = useState([]);
    
    const [prevCourses, setPrevCourses] = useState(["CSC 1301", "CSC 1302", "CSC 4351"]);


    const [userAbout, setUserAbout] = useState("As a highly motivated and dedicated individual, I am passionate about leveraging my skills and expertise to drive innovation and growth. With a strong foundation in");
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
            <div className="edit-profile-window" style={{display: isEditWindowOpen ? "block" : "none"}}>
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
                            <button onClick={() => setUserBio(currentUserBio)}>Save</button>
                        </div>

                        <div className="edit-github-link">
                            <h4 className="noto-sans">Edit GitHub Link</h4>
                            <input
                            type="text"
                            placeholder="GitHub Link"
                            value={tempGithubLink} // Bind the temporary state to the input
                            onChange={(e) => setTempGithubLink(e.target.value)} // Update temporary state on input change
                            />
                            <button
                            onClick={() => {
                                setGithubLink(tempGithubLink); // Update the actual GitHub link state
                                alert(`GitHub Link Updated: ${tempGithubLink}`);
                            }}
                            >
                            Save
                            </button>
                            <p>Current GitHub Link: {githubLink}</p>
                        </div>

                        <div className="edit-about">
                            <h4 className="noto-sans">Edit About</h4>
                            <textarea
                                value={currentUserAbout || userAbout}
                                onChange={(e) => setCurrentUserAbout(e.target.value)}
                                placeholder="About"
                            />
                            <button onClick={() => setUserAbout(currentUserAbout)}>Save</button>
                        </div>
                        <EditCourses
                            allCourses={allCourses}
                            title="Edit Current Courses"
                            initialCourses={courses}
                        />
                        <EditCourses
                            allCourses={allCourses}
                            title="Edit Previous Courses"
                            initialCourses={prevCourses}
                        />
                        <div className="edit-projects">
                            <h4 className="noto-sans">Edit Projects</h4>
                            <div className="edit-projects-cards">
                          {projects.map((project, index) => (
                                <div key={index} className="edit-projects-card">
                                <div className="edit-projects-card-top-row">
                                    {/* Delete Project */}
                                    <img
                                    src="/images/close-arrow.png"
                                    alt="Delete"
                                    onClick={() =>
                                        setProjects(projects.filter((_, projectIndex) => projectIndex !== index))
                                    }
                                    style={{ cursor: "pointer" }}
                                    />
                                </div>
                                {/* Project Title */}
                                <textarea
                                    value={project.title}
                                    placeholder="Project Name"
                                    onChange={(e) => {
                                    const updatedProjects = [...projects];
                                    updatedProjects[index].title = e.target.value;
                                    setProjects(updatedProjects);
                                    }}
                                />
                                {/* Project Link */}
                                <textarea
                                    value={project.link}
                                    placeholder="Link"
                                    onChange={(e) => {
                                    const updatedProjects = [...projects];
                                    updatedProjects[index].link = e.target.value;
                                    setProjects(updatedProjects);
                                    }}
                                />
                                {/* Project Description */}
                                <textarea
                                    value={project.description}
                                    placeholder="Description"
                                    onChange={(e) => {
                                    const updatedProjects = [...projects];
                                    updatedProjects[index].description = e.target.value;
                                    setProjects(updatedProjects);
                                    }}
                                />
                                {/* Save Button */}
                                <button
                                    onClick={() => {
                                    console.log("Saved Project:", projects[index]);
                                    alert("Project saved!");
                                    }}
                                >
                                    Save
                                </button>
                                </div>
                        ))}
                        </div>

                        <div className="add-project">
                            <h4 className="noto-sans">Add Project</h4>
                            <textarea
                                value={newProject.title}
                                placeholder="Project Name"
                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}>

                                </textarea>
                            <textarea
                                value={newProject.link}
                                placeholder="Link"
                                onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}>

                                </textarea>
                            <textarea
                                value={newProject.description}
                                placeholder="Description"
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}>

                                </textarea>
                            <button onClick={addProject}>Add Project</button>
                        </div>

                        </div>
                        <div className="edit-times-available">
                            {Object.entries(availableTimes).map(([day, times]) => (
                                <DaySchedule
                                key={day}
                                day={day}
                                times={times}
                                onUpdate={handleUpdate}
                                />
                            ))}
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
                        src={profileImage}
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
                        href={githubLink.startsWith("http") ? githubLink : `https://${githubLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        <img src="/images/github-icon.png" alt="GitHub Link" />
                        </a>

                        
                        <div className="edit-icon-name-about-profile"><img onClick={() => setIsEditWindowOpen(true)}  src="/images/edit.png"></img></div>
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
                            <div className="buddy-profile-previous-course-card">MATH 1113</div>
                            <div className="buddy-profile-previous-course-card">CSC 1301</div>
                            <div className="buddy-profile-previous-course-card">ENGL 1101</div>

                        </div>
                    </div>

                </div>

                <div className="buddy-profile-book-study-session">
                    <h3 className="noto-sans">Book Study Session</h3>
                    <h4 className="noto-sans">Available sessions</h4>
                    <div className="study-session-cards">
                        {user.availableSessions.map((session, index) => (
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
                <Matches/>
            </div>
            
        </div>
    )
}

export default OwnProfileSection;