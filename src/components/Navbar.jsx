import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";



function Navbar() {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate("/search"); // Navigate to the search page
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
  };

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
        <div className="home-toolbar-item home-link"  onClick={handleHomeClick}  style={{ cursor: "pointer" }}>
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
            <p className="notification-p noto-sans">Notifications</p>
          </div>
          {isNotificationOpen && (
            <div
              className="notification-dropdown-window"
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
            >
              <div className="notification-drop-flexbox">
                <div className="notification-drop-item">Option 1</div>
                <div className="notification-drop-item">Option 2</div>
                <div className="notification-drop-item">Option 3</div>
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
                <div className="profile-drop-item">Sign Out</div>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
