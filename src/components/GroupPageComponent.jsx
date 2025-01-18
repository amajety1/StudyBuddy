import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/GroupPageComponent.css';

function GroupPageComponent() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);

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

  useEffect(() => {
    const fetchGroupAndUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch group details
        const groupResponse = await fetch(`http://localhost:5001/api/groups/${groupId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!groupResponse.ok) {
          throw new Error('Failed to fetch group details');
        }
        
        const groupData = await groupResponse.json();
        setGroup(groupData);

        // Fetch current user
        const userResponse = await fetch('http://localhost:5001/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details');
        }

        const userData = await userResponse.json();
        setCurrentUser(userData);

      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupAndUser();
  }, [groupId]);

  const handleJoinRequest = async () => {
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

      // Update the UI to show pending status
      setGroup(prev => ({
        ...prev,
        pendingRequests: [...prev.pendingRequests, { user: currentUser._id, status: 'pending' }]
      }));
    } catch (error) {
      console.error('Error sending join request:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Group not found</div>
      </div>
    );
  }

  const isOwner = currentUser?._id === group.owner._id;
  const isMember = group.members.some(member => member._id === currentUser?._id);
  const hasPendingRequest = group.pendingRequests?.some(
    request => request.user === currentUser?._id && request.status === 'pending'
  );

  const renderMembershipStatus = () => {
    if (isOwner) {
      return <span className="group-status status-owner">Owner</span>;
    }
    if (isMember) {
      return (
        <button
          onClick={() => setShowChat(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Open Chat
        </button>
      );
    }
    if (hasPendingRequest) {
      return <span className="group-status status-pending">Request Pending</span>;
    }
    return (
      <button className="join-button" onClick={handleJoinRequest}>
        Request to Join
      </button>
    );
  };

  return (
    <div className="group-page-container">
      <div className="group-header">
        <div className="group-header-content">
          <div className="group-info">
            <img
              src={getImageUrl(group.profilePicture, 'group')}
              alt={group.name}
              className="group-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getDefaultImage('group');
              }}
            />
            <div className="group-text">
              <h1 className="group-name">{group.name}</h1>
              <p className="group-course">{group.course}</p>
              {renderMembershipStatus()}
            </div>
          </div>
        </div>
      </div>

      <div className="group-content">
        <div className="group-description">
          <h2 className="section-title">About</h2>
          <p>{group.description}</p>
        </div>

        <div className="group-details">
          <div className="detail-item">
            <h3>Owner</h3>
            <p>{`${group.owner.firstName} ${group.owner.lastName}`}</p>
          </div>
          <div className="detail-item">
            <h3>Created</h3>
            <p>{new Date(group.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="members-section">
          <h2 className="section-title">Members ({group.members.length})</h2>
          <div className="members-grid">
            {group.members.map(member => (
              <div key={member._id} className="member-card">
                <img
                  src={getImageUrl(member.profilePicture, 'user')}
                  alt={member.firstName}
                  className="member-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getDefaultImage('user');
                  }}
                />
                <div className="member-info">
                  <p className="member-name">{`${member.firstName} ${member.lastName}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showChat && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 w-full max-w-4xl">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">{group.name} - Group Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ExpandedChatWindow chatRoomId={group.chatRoom} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupPageComponent;
