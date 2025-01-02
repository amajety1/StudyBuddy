import React, { useState } from "react";
import '../styles/SearchPage.css'; // Adjust the path based on your structure
import Header from './Header'
import Navbar from './Navbar'

function SearchPageComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(10);



  const [groups] = useState([
    {
      id: 1,
      name: "Data Science Enthusiasts",
      course: "CSC 2720",
      description: "A group for data science lovers.",
    },
    {
      id: 2,
      name: "Web Dev Wizards",
      course: "CSC 3350",
      description: "Learn and build amazing websites.",
    },
  ]);

  const [users] = useState([
    {
      id: 1,
      name: "Alice",
      courses: ["CSC 2720", "CSC 3320"],
      projects: ["WeatherWise", "Expense Tracker"],
    },
    {
      id: 2,
      name: "Bob",
      courses: ["CSC 1302", "CSC 4520"],
      projects: ["StudyBuddy App"],
    },
  ]);

  const [pendingRequests, setPendingRequests] = useState([]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const groupMatches = groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.course.toLowerCase().includes(query)
    );

    const userMatches = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.courses.some((course) => course.toLowerCase().includes(query)) ||
        user.projects.some((project) => project.toLowerCase().includes(query))
    );

    setFilteredResults([...groupMatches, ...userMatches].slice(0, displayLimit));
  };

  const handleLoadMore = () => {
    setDisplayLimit(displayLimit + 5);
    setFilteredResults([...groups, ...users].slice(0, displayLimit + 5));
  };

  const handleRequest = (type, id) => {
    setPendingRequests((prev) => [...prev, `${type}-${id}`]);
  };

  return (
    <div className="search-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for groups or users..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="search-results">
        {filteredResults.map((result, index) =>
          result.name && result.description ? (
            // Render group boxes
            <div key={result.id} className="group-box">
              <h3>{result.name}</h3>
              <p>Course: {result.course}</p>
              <p>{result.description}</p>
              <button
                onClick={() => handleRequest("group", result.id)}
                disabled={pendingRequests.includes(`group-${result.id}`)}
              >
                {pendingRequests.includes(`group-${result.id}`)
                  ? "Request Pending"
                  : "Join"}
              </button>
            </div>
          ) : (
            // Render user boxes
            <div key={result.id} className="user-box">
              <h3>{result.name}</h3>
              <p>Courses: {result.courses.join(", ")}</p>
              <p>Projects: {result.projects.join(", ")}</p>
              <button
                onClick={() => handleRequest("user", result.id)}
                disabled={pendingRequests.includes(`user-${result.id}`)}
              >
                {pendingRequests.includes(`user-${result.id}`)
                  ? "Pending"
                  : "Send Buddy Request"}
              </button>
            </div>
          )
        )}
        {filteredResults.length >= displayLimit && (
          <button className="load-more" onClick={handleLoadMore}>
            Load More
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchPageComponent;
