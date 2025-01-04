import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";



function Navbar() {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const seenNotifications = async () => {
    setHasUnseen(false);
    console.log('Has Unseen: ', hasUnseen);
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
    navigate("/login");
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
    seenNotifications();
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      console.log("Token: ", token);

      try {
        const response = await fetch("http://localhost:5001/api/users/get-notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const { notifications: receivedNotifications, hasUnseen: unseen } = await response.json();

        // Set the notifications and unseen status
        setNotifications(receivedNotifications);
        setHasUnseen(unseen);

        console.log("Fetched Notifications: ", receivedNotifications);
        console.log("Has Unseen Notifications: ", unseen);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (isNotificationOpen) setIsNotificationOpen(false);
      if (isOptionsOpen) setIsOptionsOpen(false);
    };

    // Add listener for clicks outside
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside); // Cleanup listener
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
              {notifications.map((notification, index) => (
                <div key={index} className="notification-drop-item">
                  <p className="noto-sans">{notification.content}</p>
                  <p className="noto-sans">{getTimeAgo(notification.date)}</p>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>

        <div className="home-toolbar-item profile-link">
          <img src="/images/profile-pic.png" alt="Profile" />
          <div className="navbar-text-and-arrow" onClick={handleArrowClick}>
            <a >
              <p className="noto-sans">Me</p>
            </a>
            <img src="/images/down-arrow.png" alt="Arrow" id="arrow" />
          </div>
          {isOptionsOpen && (
            <div
              className="profile-dropdown-window"
              onClick={(e) => e.stopPropagation()} // Prevent inside clicks from closing
            >
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
