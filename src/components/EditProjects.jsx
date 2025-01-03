import React, { useState } from 'react';

function EditProjects({ projects, onUpdate }) {
    const [editingProject, setEditingProject] = useState(null);
    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        techStack: "",
        githubLink: ""
    });

    const handleProjectChange = (index, field, value) => {
        const updatedProjects = [...projects];
        updatedProjects[index] = {
            ...updatedProjects[index],
            [field]: value
        };
        onUpdate(updatedProjects);
    };

    const addProject = () => {
        if (newProject.name.trim()) {
            onUpdate([...projects, { ...newProject }]);
            setNewProject({
                name: "",
                description: "",
                techStack: "",
                githubLink: ""
            });
        }
    };

    const removeProject = (index) => {
        const updatedProjects = projects.filter((_, i) => i !== index);
        onUpdate(updatedProjects);
    };

    const startEditing = (index) => {
        setEditingProject(index);
    };

    const saveProject = (index) => {
        setEditingProject(null);
    };

    return (
        <div className="edit-projects">
            <h4 className="noto-sans">Edit Projects</h4>
            <div className="edit-projects-cards">
                {projects.map((project, index) => (
                    <div key={index} className="edit-projects-card">
                        <div className="edit-projects-card-top-row">
                            <img
                                src="/images/close-arrow.png"
                                alt="Delete"
                                onClick={() => removeProject(index)}
                                style={{ cursor: "pointer" }}
                            />
                        </div>
                        
                        {editingProject === index ? (
                            <>
                                <input
                                    type="text"
                                    value={project.name}
                                    placeholder="Project Name"
                                    onChange={(e) => handleProjectChange(index, "name", e.target.value)}
                                    className="project-input"
                                />
                                <input
                                    type="text"
                                    value={project.githubLink}
                                    placeholder="GitHub Link"
                                    onChange={(e) => handleProjectChange(index, "githubLink", e.target.value)}
                                    className="project-input"
                                />
                                <textarea
                                    value={project.description}
                                    placeholder="Description"
                                    onChange={(e) => handleProjectChange(index, "description", e.target.value)}
                                    className="project-textarea"
                                />
                                <input
                                    type="text"
                                    value={project.techStack}
                                    placeholder="Tech Stack (e.g., React, Node.js)"
                                    onChange={(e) => handleProjectChange(index, "techStack", e.target.value)}
                                    className="project-input"
                                />
                                <button
                                    onClick={() => saveProject(index)}
                                    className="save-project-btn"
                                >
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <h5 className="noto-sans">{project.name}</h5>
                                <p className="github-link">
                                    <img src="/images/github-icon.png" alt="GitHub" />
                                    {project.githubLink}
                                </p>
                                <p className="project-description">{project.description}</p>
                                <p className="tech-stack">Tech Stack: {project.techStack}</p>
                                <button
                                    onClick={() => startEditing(index)}
                                    className="edit-project-btn"
                                >
                                    Edit Project
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="add-project">
                <h5 className="noto-sans">Add New Project</h5>
                <input
                    type="text"
                    value={newProject.name}
                    placeholder="Project Name"
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="project-input"
                />
                <input
                    type="text"
                    value={newProject.githubLink}
                    placeholder="GitHub Link"
                    onChange={(e) => setNewProject({ ...newProject, githubLink: e.target.value })}
                    className="project-input"
                />
                <textarea
                    value={newProject.description}
                    placeholder="Description"
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="project-textarea"
                />
                <input
                    type="text"
                    value={newProject.techStack}
                    placeholder="Tech Stack (e.g., React, Node.js)"
                    onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                    className="project-input"
                />
                <button 
                    onClick={addProject}
                    className="add-project-btn"
                >
                    Add Project
                </button>
            </div>
        </div>
    );
}

export default EditProjects;
