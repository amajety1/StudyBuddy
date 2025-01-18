import React, { useState, useEffect } from "react";
import '../styles/SearchPage.css';
import Header from './Header'
import Navbar from './Navbar'
import { useNavigate } from 'react-router-dom';

function SearchPageComponent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [groups, setGroups] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem('token');

  const navigateToProfile = (matchId) => {
    navigate(`/buddy/${matchId}`);
  };

  const navigateToGroup = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const navigateToOwnProfile = () => {
    navigate('/profile');
  };

  // Helper function to get default image URL
  const getDefaultImage = (type) => {
    return type === 'group' ? '/images/default-group.svg' : '/images/default-profile.jpg';
  };

  // Helper function to get image URL
  const getImageUrl = (profilePicture, type) => {
    if (!profilePicture) {
      return getDefaultImage(type);
    }
    return profilePicture.startsWith('http')
      ? profilePicture
      : `${profilePicture}`;
  };

  // Helper function to determine user relationship status
  const getUserRelationshipStatus = (userId) => {
    if (!currentUser) return 'loading';

    if (currentUser._id === userId) {
      return 'self';
    }

    if (currentUser.buddies.some(buddy => buddy._id === userId)) {
      return 'connected';
    }

    if (currentUser.outgoingBuddyRequests.some(request => request._id === userId)) {
      return 'outgoing-request';
    }

    if (currentUser.incomingBuddyRequests.some(request => request._id === userId)) {
      return 'incoming-request';
    }

    return 'none';
  };

  // Helper function to render appropriate button based on relationship status
  const renderUserActionButton = (userId) => {
    const status = getUserRelationshipStatus(userId);

    switch (status) {
      case 'self':
        return (
          <button
            className="view-profile-button"
            onClick={navigateToOwnProfile}
          >
            View Your Profile
          </button>
        );
      case 'connected':
        return <span className="connected-status">Connected</span>;
      case 'outgoing-request':
        return <span className="pending-status">Request Sent</span>;
      case 'incoming-request':
        return <span className="pending-status">Respond to Request</span>;
      case 'none':
        return (
          <button
            className="send-request-button"
            onClick={() => handleBuddyRequest(userId)}
          >
            Send Buddy Request
          </button>
        );
      default:
        return null;
    }
  };

  // Helper function to determine group relationship status
  const getGroupStatus = (group) => {
    if (!currentUser) return null;

    // Check if user is a member using group.members
    const isMember = group.members?.some(member => {
      console.log('NOW WE ARE DOING THE COMPARISON:', {
        memberID: member._id,
        currentUserID: currentUser._id,
        areTheyEqual: member._id === currentUser._id
      });
      return member._id === currentUser._id;
    });

    if (isMember) {
      return 'member';
    }

    if (group.pendingRequests?.some(request =>
      request.user._id === currentUser._id && request.status === 'pending'
    )) {
      return 'pending';
    }

    return 'none';
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to send join request');
      }

      // Update the group in the search results to show pending status
      setGroups(prevGroups =>
        prevGroups.map(group => {
          if (group._id === groupId) {
            return {
              ...group,
              pendingRequests: [...(group.pendingRequests || []), { user: currentUser._id, status: 'pending' }]
            };
          }
          return group;
        })
      );
    } catch (error) {
      console.error('Error sending group join request:', error);
    }
  };

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

  const renderGroupStatus = (group) => {
    const status = getGroupStatus(group);

    switch (status) {
      case 'member':
        return (
          <button 
            className="px-4 py-2 bg-green-100 text-green-800 rounded-md font-medium" 
            disabled
          >
            Member
          </button>
        );
      case 'pending':
        return (
          <button 
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md font-medium" 
            disabled
          >
            Pending
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleGroupRequest(group._id)}
            disabled={pendingRequests.includes(`group-${group._id}`)}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400"
          >
            {pendingRequests.includes(`group-${group._id}`) ? "Request Pending" : "Join Group"}
          </button>
        );
    }
  };

  // Fetch groups and users only once when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch current user
        const userResponse = await fetch('http://localhost:5001/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch current user');
        }

        const userData = await userResponse.json();

        setCurrentUser(userData);

        // Fetch groups
        const groupsResponse = await fetch("http://localhost:5001/api/get-all-groups", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (!groupsResponse.ok) {
          const errorData = await groupsResponse.json().catch(() => ({}));
          console.error('Groups fetch error:', errorData);
          throw new Error(`Failed to fetch groups: ${errorData.message || groupsResponse.statusText}`);
        }

        const groupsData = await groupsResponse.json();
        // Add type property to each group
        const groupsWithType = groupsData.map(group => ({
          ...group,
          type: 'group'
        }));
        setGroupResults(groupsWithType);

        // Fetch users
        const usersResponse = await fetch("http://localhost:5001/api/get-all-users", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const usersData = await usersResponse.json();
        // Add type property to each user
        const usersWithType = usersData.map(user => ({
          ...user,
          type: 'user'
        }));
        setUsers(usersWithType);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Unable to load data');
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, [token]);

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
    const matchedGroups = groupResults.filter(group =>
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

  const handleUserClick = (user) => {
    navigateToProfile(user._id);
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
                      src={getImageUrl(result.profilePicture, result.type)}
                      alt={result.type === 'user' ? `${result.firstName} ${result.lastName}` : result.name}
                      onClick={() => result.type === 'user' ? handleUserClick(result) : navigateToGroup(result._id)}
                      className="search-profile-pic mr-3 cursor-pointer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getDefaultImage(result.type);
                      }}
                    />
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold">{result.name}</h3>
                      <p className="text-gray-600">{result.course}</p>
                    </div>
                    <div className="ml-auto">
                      {result.type === 'group' && renderGroupStatus(result)}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">Members: {result.members.length}</p>
                  <p className="text-gray-700 mb-4 line-clamp-2">{result.description}</p>
                </div>
              </div>
            ) : (
              // User card
              <div key={result._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                <div className="flex items-center mb-4">
                  <img
                    src={getImageUrl(result.profilePicture, result.type)}
                    alt={result.type === 'user' ? `${result.firstName} ${result.lastName}` : result.name}
                    onClick={() => result.type === 'user' ? handleUserClick(result) : navigateToGroup(result._id)}
                    className="search-profile-pic mr-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDefaultImage(result.type);
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
                <div className="search-result-actions">
                  {renderUserActionButton(result._id)}
                </div>
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
