import React, { useState } from "react";

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

function ProfileInfo() {
  const [github, setGithub] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [search, setSearch] = useState(""); // Search query for courses
  const [projects, setProjects] = useState([]);
  const [isAddingProject, setIsAddingProject] = useState(false); // Toggle for showing project input fields
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    techStack: "",
    githubLink: "",
  });

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) =>
    course.toLowerCase().includes(search.toLowerCase())
  );

  // Add selected course
  const addCourse = (course) => {
    if (!selectedCourses.includes(course)) {
      setSelectedCourses([...selectedCourses, course]);
      setSearch(""); // Clear search after adding
    }
  };

  // Remove course
  const removeCourse = (courseToRemove) => {
    setSelectedCourses(selectedCourses.filter((course) => course !== courseToRemove));
  };

  // Handle input changes for project
  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  // Add new project
  const addProject = () => {
    if (newProject.name.trim()) {
      setProjects([...projects, { ...newProject }]);
      setNewProject({ name: "", description: "", techStack: "", githubLink: "" });
      setIsAddingProject(false); // Collapse input fields
    }
  };

  // Edit project
  const editProject = (index) => {
    setNewProject(projects[index]);
    setIsAddingProject(true);
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="login-container">
      <div className="login-image-half"></div>
      <div className="login-text-half">
        <div className="login-heading-description">
          <h2 className="noto-sans">Profile</h2>
        </div>
        <div className="profile-form">
          {/* GitHub Input */}
          <div className="email-form">
            <label className="noto-sans">GitHub Profile</label>
            <input
              className="noto-sans github-input-box"
              type="text"
              placeholder="Enter GitHub Link Here:"
              required
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

          {/* Continue Button */}
          <button type="submit" className="login-button noto-sans">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfo;
