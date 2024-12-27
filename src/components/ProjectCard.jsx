import React from "react";

function ProjectCard({ title, link, description }) {
  return (
    <div className="buddy-profile-project-card">
      <div className="buddy-profile-project-card-title-and-link">
        <h5 className="noto-sans">{title}</h5>
        <a href={link} target="_blank" rel="noopener noreferrer">
          <img src="/images/github-icon.png" alt="GitHub" />
        </a>
      </div>
      <div className="buddy-profile-project-card-description">
        <h6 className="noto-sans">{description}</h6>
      </div>
    </div>
  );
}

export default ProjectCard;
