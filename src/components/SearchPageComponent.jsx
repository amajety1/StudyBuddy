import React, { useState, useEffect } from "react";
import '../styles/SearchPage.css';
import Header from './Header'
import Navbar from './Navbar'

function SearchPageComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const token = localStorage.getItem('token');

  // Helper function to get image URL
  const getImageUrl = (profilePicture, type) => {
    if (!profilePicture) {
      return type === 'group' ? '/images/group.jpg' : '/images/empty-profile-pic.png';
    }
    // If it's a full URL, use it directly
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    // If it's a relative path, prepend the server URL
    return `http://localhost:5001${profilePicture}`;
  };

  // Fetch groups and users only once when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch groups
        const groupsResponse = await fetch("http://localhost:5001/api/get-all-groups", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const groupsData = await groupsResponse.json();
        setGroups(groupsData);

        // Fetch users
        const usersResponse = await fetch("http://localhost:5001/api/get-all-users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Unable to load data');
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const handleGroupRequest = async (groupId) => {
    setPendingRequests(prev => [...prev, `group-${groupId}`]);
    try {
      const response = await fetch('http://localhost:5001/api/users/request-join-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send group request');
      }

      alert('Join request sent!');
    } catch (err) {
      console.error('Error sending group request:', err);
      setPendingRequests(prev => prev.filter(item => item !== `group-${groupId}`));
    }
  };

  const handleBuddyRequest = async (userId) => {
    setPendingRequests(prev => [...prev, `user-${userId}`]);
    try {
      const response = await fetch('http://localhost:5001/api/users/send-buddy-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchId: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send buddy request');
      }

      alert('Buddy request sent!');
    } catch (err) {
      console.error('Error sending buddy request:', err);
      setPendingRequests(prev => prev.filter(item => item !== `user-${userId}`));
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter groups
    const matchedGroups = groups.filter(group =>
      group.name.toLowerCase().includes(query) ||
      group.course.toLowerCase().includes(query) ||
      (group.description && group.description.toLowerCase().includes(query))
    );

    // Filter users
    const matchedUsers = users.filter(user =>
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query)) ||
      (user.selectedCourses && user.selectedCourses.some(course => course.toLowerCase().includes(query))) ||
      (user.projects && user.projects.some(project => project.toLowerCase().includes(query)))
    );

    // Combine and set filtered results
    setFilteredResults([...matchedGroups, ...matchedUsers].slice(0, displayLimit));
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 10);
  };

  return (
    <div className="search-page p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="search-bar mb-8">
          <input
            type="text"
            placeholder="Search for groups or users..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full p-4 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        <div className="search-results grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((result) => (
            result.name && result.description ? (
              // Group card
              <div key={result._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <img
                      src={getImageUrl(result.profilePicture, 'group')}
                      alt={result.name}
                      className="search-profile-pic mr-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/group.jpg';
                      }}
                    />
                    <h3 className="text-xl font-bold">{result.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-2">Course: {result.course}</p>
                  <p className="text-gray-600 mb-4">Members: {result.members.length}</p>
                  <p className="text-gray-700 mb-4 line-clamp-2">{result.description}</p>
                  <button
                    onClick={() => handleGroupRequest(result._id)}
                    disabled={pendingRequests.includes(`group-${result._id}`)}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400"
                  >
                    {pendingRequests.includes(`group-${result._id}`) ? "Request Pending" : "Join Group"}
                  </button>
                </div>
              </div>
            ) : (
              // User card
              <div key={result._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                <div className="flex items-center mb-4">
                  <img
                    src={getImageUrl(result.profilePicture, 'user')}
                    alt={`${result.firstName}'s profile`}
                    className="search-profile-pic mr-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/empty-profile-pic.png';
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-bold">{result.firstName} {result.lastName}</h3>
                    {result.major && <p className="text-gray-600">{result.major}</p>}
                  </div>
                </div>
                {result.selectedCourses && (
                  <p className="text-gray-600 mb-2">
                    Courses: {result.selectedCourses.join(", ")}
                  </p>
                )}
                {result.projects && (
                  <p className="text-gray-600 mb-4">
                    Projects: {result.projects.join(", ")}
                  </p>
                )}
                <button
                  onClick={() => handleBuddyRequest(result._id)}
                  disabled={pendingRequests.includes(`user-${result._id}`)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400"
                >
                  {pendingRequests.includes(`user-${result._id}`) ? "Request Pending" : "Send Buddy Request"}
                </button>
              </div>
            )
          ))}
        </div>

        {filteredResults.length >= displayLimit && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              className="bg-white text-indigo-600 py-2 px-6 rounded-md border border-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPageComponent;
