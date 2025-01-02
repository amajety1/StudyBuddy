import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExpandedChatWindow from '../components/ExpandedChatWindow';

function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Group Header */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src={group.profilePicture}
              alt={group.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{group.course}</p>
            </div>
          </div>
          {isMember && (
            <button
              onClick={() => setShowChat(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Open Chat
            </button>
          )}
          {!isMember && !hasPendingRequest && (
            <button
              onClick={handleJoinRequest}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Request to Join
            </button>
          )}
          {hasPendingRequest && (
            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md">
              Request Pending
            </span>
          )}
        </div>

        {/* Group Details */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{group.description}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {`${group.owner.firstName} ${group.owner.lastName}`}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(group.createdAt).toLocaleDateString()}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Members ({group.members.length})</dt>
              <dd className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.members.map(member => (
                  <div
                    key={member._id}
                    className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md"
                  >
                    <img
                      src={member.profilePicture}
                      alt={member.firstName}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {`${member.firstName} ${member.lastName}`}
                      </p>
                    </div>
                  </div>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Chat Window */}
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

export default GroupPage;
