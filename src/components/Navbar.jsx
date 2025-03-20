import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Navbar.css';

function Navbar() {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const navigateToProfile = (user) => {
    navigate(`/buddy/${user._id}`);
  };

  const seenNotifications = async () => {
    setHasUnseen(false);
    try {
      const response = await fetch('http://localhost:5001/api/users/seen-notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to mark notifications as seen');
      }
    } catch (error) {
      console.error('Error marking notifications as seen:', error);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const differenceInSeconds = Math.floor((now - notificationDate) / 1000);

    if (differenceInSeconds < 60) {
      return `${differenceInSeconds} seconds ago`;
    } else if (differenceInSeconds < 3600) {
      const minutes = Math.floor(differenceInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (differenceInSeconds < 86400) {
      const hours = Math.floor(differenceInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(differenceInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  const handleSearchClick = () => {
    navigate("/search"); // Navigate to the search page
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Force reload to login page
};

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the profile page
  }

  const handleHomeClick = () => {
    navigate("/home"); // Navigate to the home page
  };

  const handleCreateGroupClick = () => {
    navigate("/create-group"); // Navigate to the create group page
  };

  const handleArrowClick = () => {
    setIsOptionsOpen(!isOptionsOpen);
  };

  const handleNotificationClick = (e) => {
    e.stopPropagation(); // Prevent closing on inside clicks
    setIsNotificationOpen(!isNotificationOpen);

    if (!isNotificationOpen) {
      // Add a slight delay before marking notifications as seen
      setTimeout(async () => {
        try {
          await seenNotifications(); // Update the server
          // Update local state after the delay
          setNotifications((prevNotifications) =>
            prevNotifications.map((notification) => ({
              ...notification,
              seen: true,
            }))
          );
          setHasUnseen(false); // Remove the unseen indicator
        } catch (error) {
          console.error("Error marking notifications as seen:", error);
        }
      }, 1000); // 1-second delay
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5001/api/users/get-notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const notifications = await response.json();
        setNotifications(notifications);
        setHasUnseen(notifications.some(notif => !notif.seen));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside the dropdowns
      if (isNotificationOpen && !event.target.closest('.notification-dropdown')) {
        setIsNotificationOpen(false);
      }
      if (isOptionsOpen && !event.target.closest('.profile-link')) {
        setIsOptionsOpen(false);
      }
    };

    // Add listener for clicks outside
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isNotificationOpen, isOptionsOpen]);

  return (
    <div className="home-toolbar-total">
      <div className="home-toolbar-left-search">
        <div
          className="navbar-search-bar"
          onClick={handleSearchClick}
          style={{ cursor: "pointer" }}
        >
          <img src="/images/search.png" alt="Search" />
          <h3 className="noto-sans">Search</h3>
        </div>
      </div>
      <div className="home-toolbar-right-items">
        <div className="home-toolbar-item home-link" onClick={handleHomeClick} style={{ cursor: "pointer" }}>
          <a>
            <div className="flex-for-navbar">
              <img src="/images/study-logo.png" alt="Home" />
              <p className="noto-sans">Home</p>
            </div>
          </a>
        </div>
        <div className="home-toolbar-item create-group-link" onClick={handleCreateGroupClick} style={{ cursor: "pointer" }}>
          <a >
            <div className="flex-for-navbar">
              <img src="/images/create-group.png" alt="Create Group" />
              <p className="noto-sans">Create Group</p>
            </div>
          </a>
        </div>

        <div className="home-toolbar-item notification-dropdown">
          <div className="flex-for-navbar" onClick={handleNotificationClick}>
            <img src="/images/notification.png" alt="Notifications" />
            {hasUnseen && <div className="notification-dot"></div>}
            <p className="notification-p noto-sans">Notifications</p>
          </div>
          {isNotificationOpen && (
            <div
              className="notification-dropdown-window"
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
            >
              <div className="notification-drop-flexbox">
                {notifications.map((notification) => (
                  <div key={notification._id} className="notification-item">
                    <p className="noto-sans">{notification.content}</p>
                    <img src={notification.from_user.profilePicture} onClick={() => { navigateToProfile(notification.from_user) }}></img>
                    <p className="noto-sans">{getTimeAgo(notification.date)}</p>

                    {(notification.type === 'buddy_request' || notification.type === 'group_join_request') && (
                      <div className="notification-actions">
                        {notification.status ? (
                          <div className={`status-badge ${notification.status.toLowerCase()}`}>
                            {notification.status}
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  const endpoint = notification.type === 'buddy_request'
                                    ? '/api/users/accept-buddy-request'
                                    : '/api/groups/approve-join-group';

                                  console.log('Notification data:', notification);
                                  console.log('Request body:', notification.type === 'buddy_request'
                                    ? { fromUser: notification.from_user._id }
                                    : {
                                      groupId: notification.groupId,
                                      userId: notification.from_user._id
                                    });

                                  const response = await fetch(`http://localhost:5001${endpoint}`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`,
                                    },
                                    body: JSON.stringify(
                                      notification.type === 'buddy_request'
                                        ? { fromUser: notification.from_user._id }
                                        : {
                                          groupId: notification.groupId,
                                          userId: notification.from_user._id
                                        }
                                    ),
                                  });

                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.error || 'Failed to accept request');
                                  }

                                  // First update status to show accepted
                                  setNotifications(prev => prev.map(n =>
                                    n._id === notification._id
                                      ? { ...n, status: 'Accepted' }
                                      : n
                                  ));

                                  // Delete notification from database
                                  await deleteNotification(notification._id);

                                  // Remove notification from UI after a brief delay
                                  setTimeout(() => {
                                    setNotifications(prev =>
                                      prev.filter(n => n._id !== notification._id)
                                    );
                                  }, 1500);
                                } catch (error) {
                                  console.error('Error accepting request:', error);
                                  alert(error.message || 'Failed to accept request. Please try again.');
                                }
                              }}
                              className="accept-btn"
                            >
                              Accept
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const endpoint = notification.type === 'buddy_request'
                                    ? '/api/users/reject-buddy-request'
                                    : '/api/groups/reject-join-group';

                                  const response = await fetch(`http://localhost:5001${endpoint}`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      fromUser: notification.from_user._id,
                                      groupId: notification.groupId,
                                      userId: notification.from_user._id
                                    }),
                                  });

                                  if (!response.ok) {
                                    throw new Error('Failed to reject request');
                                  }

                                  // Update notification status
                                  setNotifications(prev => prev.map(n =>
                                    n._id === notification._id
                                      ? { ...n, status: 'Rejected' }
                                      : n
                                  ));
                                } catch (error) {
                                  console.error('Error rejecting request:', error);
                                  alert('Failed to reject request. Please try again.');
                                }
                              }}
                              className="reject-button"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        <div className="home-toolbar-item profile-link">
          <img src="/images/profile-pic.png" alt="Profile" />
          <div 
            className="navbar-text-and-arrow" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOptionsOpen(!isOptionsOpen);
            }}
          >
            <p className="noto-sans">Me</p>
            <img src="/images/down-arrow.png" alt="Arrow" id="arrow" />
          </div>
          {isOptionsOpen && (
            <div className="profile-dropdown-window">
              <div className="profile-drop-flexbox">
                <div className="profile-drop-item" onClick={handleProfileClick}>My Profile</div>
                <div className="profile-drop-item">Settings</div>
                <div onClick={handleSignOut} className="profile-drop-item">Sign Out</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
