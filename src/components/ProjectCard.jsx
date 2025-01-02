import React from "react";

function ProjectCard({ name, description, techStack, githubLink }) {
  return (
    <div className="buddy-profile-project-card">
      <div className="buddy-profile-project-card-title-and-link">
        <h5 className="noto-sans">{name}</h5>
        <a href={githubLink} target="_blank" rel="noopener noreferrer">
          <img src="/images/github-icon.png" alt="GitHub" />
        </a>
      </div>
      <div className="buddy-profile-project-card-description">
        <h6 className="noto-sans">{description}</h6>
      </div>
      <div className="buddy-profile-project-card-tech-stack">
        <h6 className="noto-sans">{techStack}</h6>
      </div>
    </div>
  );
}

export default ProjectCard;
