import React, { useState, useEffect } from "react";
import Matches from "./Matches";
import EditCourses from "./EditCourses";
import ProjectCard from "./ProjectCard";
import DaySchedule from "./DaySchedule";

function OwnProfileSection() {
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState("/images/empty-profile-pic.png");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch user data including profile picture on component mount
    useEffect(() => {
        console.log("Initial profileImage:", profileImage);
        
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log("Token:", token);
                
                if (!token) {
                    console.log("No token found");
                    return;
                }

                const response = await fetch('http://localhost:5001/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    console.log("Fetched user data:", userData);
                    setUser(userData);
                    
                    // Update profile image URL to use our new endpoint with cache busting
                    if (userData._id) {
                        setProfileImage(`http://localhost:5001/api/profile-picture/${userData._id}?t=${Date.now()}`);
                    }
                } else {
                    console.log("Failed to fetch user data:", response.status);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        console.log("profileImage state changed to:", profileImage);
    }, [profileImage]); // Log whenever profileImage changes

    const handleUpdate = (day, updatedTimes) => {
        setAvailableTimes((prev) => ({
          ...prev,
          [day]: updatedTimes,
        }));
      };

      const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file && user) {
            try {
                setIsLoading(true);
                console.log("File selected:", file.name);

                // Upload to server
                const formData = new FormData();
                formData.append('profilePicture', file);
                formData.append('userId', user._id);

                console.log("Uploading to server...");
                const uploadResponse = await fetch('http://localhost:5001/api/users/upload-profile-picture', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload profile picture');
                }

                const { profilePicturePath } = await uploadResponse.json();
                console.log("Upload successful, path:", profilePicturePath);

                // Update user profile with new picture path
                const token = localStorage.getItem('token');
                const updateResponse = await fetch('http://localhost:5001/api/users/update-profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...user,
                        profilePicture: profilePicturePath
                    })
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update user profile');
                }

                console.log("Profile updated successfully");
                // Update the image URL to use our new endpoint
                setProfileImage(`http://localhost:5001/api/profile-picture/${user._id}?t=${Date.now()}`);
            } catch (error) {
                console.error('Error updating profile picture:', error);
                alert('Failed to update profile picture. Please try again.');
                // Revert to previous profile picture
                if (user?._id) {
                    setProfileImage(`http://localhost:5001/api/profile-picture/${user._id}`);
                } else {
                    setProfileImage("/images/empty-profile-pic.png");
                }
            } finally {
                setIsLoading(false);
            }
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
          title: "WeatherWise 1",
          link: "https://github.com",
          description:
            "WeatherWise is a smart weather application that provides real-time weather updates, forecasts, and suggestions for activities based on local conditions. It uses OpenWeatherMap's API and integrates with Google Calendar to recommend the best times for outdoor activities.",
        },
        {
          title: "WeatherWise 2",
          link: "https://github.com",
          description:
            "WeatherWise is a smart weather application that provides real-time weather updates, forecasts, and suggestions for activities based on local conditions. It uses OpenWeatherMap's API and integrates with Google Calendar to recommend the best times for outdoor activities.",
        },
        {
          title: "WeatherWise 3",
          link: "https://github.com",
          description:
            "WeatherWise is a smart weather application that provides real-time weather updates, forecasts, and suggestions for activities based on local conditions. It uses OpenWeatherMap's API and integrates with Google Calendar to recommend the best times for outdoor activities.",
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
                            <h3 className="noto-sans">Aniket Majety</h3>
                            <p className="noto-sans">{userBio}</p>
                        </div>
                        <div className="buddy-profile-brief-edu">
                            <h3 className="noto-sans">Computer Science</h3>
                            <p className="noto-sans">BS</p>
                            <div className="buddy-profile-line"></div>
                        </div>
                    </div>
                </div>
                <div className="buddy-profile-about-github">
                    <h3>About</h3>
                    <p>{userAbout}</p>                    
                    <div className="buddy-profile-line"></div>
                </div>
                <div className="buddy-profile-courses">
                    <h3 className="noto-sans">Courses</h3>
                    <div className="buddy-profile-current-course-and-label">
                        <h5 className="noto-sans">Current Courses</h5>
                        <div className="buddy-profile-current-courses">
                            <div className="buddy-profile-current-course-card">CSC 1302</div>
                            <div className="buddy-profile-current-course-card">MATH 2212</div>
                            <div className="buddy-profile-current-course-card">PERS 2001</div>
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
                        {Object.entries(availableTimes).map(([day, times]) =>
                            times.map((time, index) => (
                            <div key={`${day}-${index}`} className="buddy-profile-session-card">
                                <h6 className="noto-sans">Day: {day.charAt(0).toUpperCase() + day.slice(1)}</h6>
                                <h6 className="noto-sans">Time: {time.start} - {time.end}</h6>
                                <h6 className="noto-sans">Online</h6>
                            </div>
                            ))
                        )}
                    </div>
                </div>

                    <div className="buddy-profile-projects">
                        <h3 className="noto-sans">Projects</h3>
                        <div className="buddy-profile-projects-cards">
                            {projects.map((project, index) => (
                            <ProjectCard
                                key={index}
                                title={project.title}
                                link={project.link}
                                description={project.description}
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