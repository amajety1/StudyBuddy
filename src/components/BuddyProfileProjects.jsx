import React, { useState } from "react";
import ProjectCard from "./ProjectCard";

function BuddyProfileProjects() {
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

  return (
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
  );
}

export default BuddyProfileProjects;
