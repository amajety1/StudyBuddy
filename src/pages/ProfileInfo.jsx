import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CAlert } from '@coreui/react';
// import "./ProfileInfo.css";


const courses = [
  "CSC 2720 - Data Structures",
  "CSC 3350 - Software Development",
  "CSC 1302 - Principles of Computer Science II",
  "CSC 1301 - Principles of Computer Science I",
  "CSC 4520 - Design and Analysis of Algorithms",
  "CSC 3210 - Computer Organization and Programming",
  "CSC 3320 - System Level Programming",
  "CSC 4320 - Operating Systems",
];

function ProfileInfo({ setIsAuthenticated }) {
  const [github, setGithub] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    techStack: "",
    githubLink: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const location = useLocation();
  const { email } = location.state; // Retrieve email from navigation state
  const navigate = useNavigate();

  const filteredCourses = courses.filter((course) =>
    course.toLowerCase().includes(search.toLowerCase())
  );

  const addCourse = (course) => {
    if (!selectedCourses.includes(course)) {
      setSelectedCourses([...selectedCourses, course]);
      setSearch("");
    }
  };

  const removeCourse = (courseToRemove) => {
    setSelectedCourses(selectedCourses.filter((course) => course !== courseToRemove));
  };

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const addProject = () => {
    if (newProject.name.trim()) {
      setProjects([...projects, { ...newProject }]);
      setNewProject({ name: "", description: "", techStack: "", githubLink: "" });
      setIsAddingProject(false);
    }
  };

  const editProject = (index) => {
    setNewProject(projects[index]);
    setIsAddingProject(true);
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size should not exceed 5MB");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
  
      const formData = new FormData();
      formData.append("profilePicture", file);
      formData.append("email", email); // Add email for initial profile creation
      
      // For initial profile creation, we don't need authorization
      const uploadResponse = await fetch("http://localhost:5001/api/users/upload-profile-picture", {
        method: "POST",
        body: formData,
      });

      console.log("[ProfileInfo] Upload response status:", uploadResponse.status);
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.log("[ProfileInfo] Upload error details:", errorText);
        throw new Error("Failed to upload profile picture");
      }
  
      const { profilePicturePath } = await uploadResponse.json();
      console.log("[ProfileInfo] Received profile picture path:", profilePicturePath);
      
      setProfilePicture(profilePicturePath);
      console.log("[ProfileInfo] Profile picture state updated");
    } catch (error) {
      console.error("[ProfileInfo] Error uploading profile picture:", error);
      setErrorMessage("Failed to upload profile picture. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const formSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/api/users/initial-profile-creation", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          github,
          selectedCourses,
          projects,
          // Only include profilePicture if one was uploaded
          ...(profilePicture && { profilePicture })
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Profile updated:", data);
        const token = data.token;
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        navigate("/home");
      } else {
        setErrorMessage(data.error || "An error occurred.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-half"></div>
      <div className="login-text-half">
        <div className="login-heading-description">
          <h2 className="noto-sans">Profile</h2>
        </div>
        <form onSubmit={formSubmit} className="profile-form">

        {/* Profile Picture Upload */}
        <div className="profile-picture-form">
            <label className="noto-sans">Upload Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
          </div>
          {/* GitHub Input */}
          <div className="email-form">
            <label className="noto-sans">GitHub Profile</label>
            <input
              className="noto-sans github-input-box"
              type="text"
              placeholder="Enter GitHub Link Here:"
              required
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
          </div>

          {/* Searchable Dropdown for Courses */}
          <div className="phone-form">
            <h4 className="noto-sans">GSU Courses</h4>
            <div className="course-input-container">
              <input
                className="noto-sans course-input-box"
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <ul className="dropdown-options">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <li
                        className="general-hover general-transition"
                        key={course}
                        onClick={() => addCourse(course)}
                      >
                        {course}
                      </li>
                    ))
                  ) : (
                    <li>No courses found</li>
                  )}
                </ul>
              )}
            </div>

            <div className="selected-courses">
              {selectedCourses.map((course) => (
                <div key={course} className="selected-item">
                  <h4>{course.split(" - ")[0]}</h4>
                  <button onClick={() => removeCourse(course)}>x</button>
                </div>
              ))}
            </div>
          </div>

          {/* Project Area */}
          <div className="project-area">
            <h4 className="noto-sans">Projects</h4>
            {!isAddingProject && (
              <button
                className="add-project-button noto-sans"
                onClick={() => setIsAddingProject(true)}
              >
                Add Project
              </button>
            )}

            {isAddingProject && (
              <div className="project-form">
                <input
                  type="text"
                  name="name"
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={handleProjectInputChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={handleProjectInputChange}
                  required
                />
                <input
                  type="text"
                  name="techStack"
                  placeholder="Tech Stack"
                  value={newProject.techStack}
                  onChange={handleProjectInputChange}
                  required
                />
                <input
                  type="text"
                  name="githubLink"
                  placeholder="GitHub Link"
                  value={newProject.githubLink}
                  onChange={handleProjectInputChange}
                  required
                />
                <button
                  className="save-project-button noto-sans"
                  onClick={addProject}
                >
                  Save Project
                </button>
              </div>
            )}

            <div className="project-list">
              {projects.map((project, index) => (
                <div key={index} className="project-item">
                  <span>{project.name}</span>
                  <button
                    className="edit-project-button"
                    onClick={() => editProject(index)}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Continue Button */}
          <button type="submit" className="login-button noto-sans">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileInfo;