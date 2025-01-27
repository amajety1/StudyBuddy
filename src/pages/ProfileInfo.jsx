import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CAlert } from '@coreui/react';
import { useEffect } from "react";
import './ProfileInfo.css';

function ProfileInfo({ setIsAuthenticated }) {
  const [courses, setCourses] = useState([]);
  const [github, setGithub] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [previousCourses, setPreviousCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [classYear, setClassYear] = useState("");
  const [major, setMajor] = useState("");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    techStack: "",
    githubLink: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const classYearOptions = [
    "Freshman",
    "Sophomore",
    "Junior",
    "Senior"
  ];

  const majorOptions = [
    "Computer Science",
    "Computer Engineering",
    "Data Science",
    "Information Technology",
    "Business Administration",
    "Marketing",
    "Finance",
    "Economics",
    "Psychology",
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Industrial Engineering",
    "Graphic Design",
    "Communication",
    "English",
    "History",
    "Political Science",
    "Sociology",
    "Environmental Science"
  ];

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/get-all-courses/', {
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data);
          console.log("[Profile] Received all courses:", data);
        } else {
          const errorText = await response.text();
          console.log("[Profile] Error details:", errorText);
        }
      } catch (error) {
        console.error('[Profile] Error fetching user data:', error);
      }
    };

    fetchAllCourses();
  }, []); // Empty dependency array means this runs once on mount

  const location = useLocation();
  const { email } = location.state; // Retrieve email from navigation state
  const navigate = useNavigate();

  const addCurrentCourse = (course) => {
    if (!selectedCourses.find(c => c._id === course._id) && !previousCourses.find(c => c._id === course._id)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const addPreviousCourse = (course) => {
    if (!previousCourses.find(c => c._id === course._id) && !selectedCourses.find(c => c._id === course._id)) {
      setPreviousCourses([...previousCourses, course]);
    }
  };

  const removeCurrentCourse = (courseToRemove) => {
    setSelectedCourses(selectedCourses.filter((course) => course._id !== courseToRemove._id));
  };

  const removePreviousCourse = (courseToRemove) => {
    setPreviousCourses(previousCourses.filter((course) => course._id !== courseToRemove._id));
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
      formData.append("email", email);
      
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
      const currentCourseIds = selectedCourses.map(course => course._id);
      const previousCourseIds = previousCourses.map(course => course._id);

      const response = await fetch("http://localhost:5001/api/users/initial-profile-creation", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          github,
          selectedCourses: currentCourseIds,
          previousCourses: previousCourseIds,
          projects,
          classYear,
          major,
          ...(profilePicture && { profilePicture })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

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
    <div className="profile-container">
      <div className="profile-image-half"></div>
      <div className="profile-content-half">
        <div className="profile-header">
          <h2 className="noto-sans">Complete Your Profile</h2>
          <p className="profile-subtitle">Let's get to know you better!</p>
        </div>
        
        <form onSubmit={formSubmit} className="profile-form">
          <div className="form-scrollable-content">
            {/* Profile Picture Section */}
            <section className="form-section">
              <h3 className="section-title">Profile Picture</h3>
              <div className="profile-picture-upload">
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="file-input"
                  />
                  <span className="upload-button">Choose Photo</span>
                </label>
              </div>
            </section>

            {/* GitHub Section */}
            <section className="form-section">
              <h3 className="section-title">GitHub Profile</h3>
              <div className="input-container">
                <input
                  className="text-input"
                  type="text"
                  placeholder="Enter your GitHub profile URL"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
            </section>

            {/* Academic Information Section */}
            <section className="form-section">
              <h3 className="section-title">Academic Information</h3>
              
              {/* Class Year Dropdown */}
              <div className="input-container">
                <select
                  className="text-input"
                  value={classYear}
                  onChange={(e) => setClassYear(e.target.value)}
                  required
                >
                  <option value="">Select Your Class Year</option>
                  {classYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Major Dropdown */}
              <div className="input-container">
                <select
                  className="text-input"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  required
                >
                  <option value="">Select Your Major</option>
                  {majorOptions.map((majorOption) => (
                    <option key={majorOption} value={majorOption}>
                      {majorOption}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Current Courses Section */}
            <section className="form-section">
              <h3 className="section-title">Current Courses</h3>
              <div className="input-container">
                <select
                  className="text-input"
                  value=""
                  onChange={(e) => {
                    const selectedCourse = courses.find(course => course._id === e.target.value);
                    if (selectedCourse) {
                      addCurrentCourse(selectedCourse);
                      e.target.value = ""; // Reset the select after adding
                    }
                  }}
                >
                  <option value="">Select Current Courses...</option>
                  {courses
                    .filter(course => !selectedCourses.some(selected => selected._id === course._id))
                    .map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.prefix} {course.number} - {course.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="selected-courses-container">
                {selectedCourses.map((course) => (
                  <div key={course._id} className="course-tag">
                    <span>{course.prefix} {course.number}</span>
                    <button 
                      type="button" 
                      onClick={() => removeCurrentCourse(course)}
                      className="remove-course"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Previous Courses Section */}
            <section className="form-section">
              <h3 className="section-title">Previous Courses</h3>
              <div className="input-container">
                <select
                  className="text-input"
                  value=""
                  onChange={(e) => {
                    const selectedCourse = courses.find(course => course._id === e.target.value);
                    if (selectedCourse) {
                      addPreviousCourse(selectedCourse);
                      e.target.value = ""; // Reset the select after adding
                    }
                  }}
                >
                  <option value="">Select Previous Courses...</option>
                  {courses
                    .filter(course => !previousCourses.some(previous => previous._id === course._id))
                    .map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.prefix} {course.number} - {course.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="selected-courses-container">
                {previousCourses.map((course) => (
                  <div key={course._id} className="course-tag">
                    <span>{course.prefix} {course.number}</span>
                    <button 
                      type="button" 
                      onClick={() => removePreviousCourse(course)}
                      className="remove-course"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects Section */}
            <section className="form-section">
              <h3 className="section-title">Projects</h3>
              {!isAddingProject ? (
                <button
                  type="button"
                  className="add-button"
                  onClick={() => setIsAddingProject(true)}
                >
                  Add Project
                </button>
              ) : (
                <div className="project-form">
                  <input
                    type="text"
                    className="text-input"
                    name="name"
                    placeholder="Project Name"
                    value={newProject.name}
                    onChange={handleProjectInputChange}
                  />
                  <textarea
                    className="text-input"
                    name="description"
                    placeholder="Project Description"
                    value={newProject.description}
                    onChange={handleProjectInputChange}
                  />
                  <input
                    type="text"
                    className="text-input"
                    name="techStack"
                    placeholder="Tech Stack"
                    value={newProject.techStack}
                    onChange={handleProjectInputChange}
                  />
                  <input
                    type="text"
                    className="text-input"
                    name="githubLink"
                    placeholder="GitHub Link"
                    value={newProject.githubLink}
                    onChange={handleProjectInputChange}
                  />
                  <button
                    type="button"
                    className="save-button"
                    onClick={addProject}
                  >
                    Save Project
                  </button>
                </div>
              )}
              <div className="projects-list">
                {projects.map((project, index) => (
                  <div key={index} className="project-item">
                    <span className="project-name">{project.name}</span>
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => editProject(index)}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="form-footer">
            <button type="submit" className="submit-button">
              Complete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileInfo;
