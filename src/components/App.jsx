import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import ProfileInfo from "../pages/ProfileInfo";
import BuddyProfile from "../pages/BuddyProfile";
import OwnProfile from "../pages/OwnProfile";
import ChatPage from "../pages/ChatPage";
import CreateGroup from "../pages/CreateGroup";
import SearchPage from "../pages/SearchPage";
import ConfirmEmail from "../pages/ConfirmEmail";
import OwnProfileBuddyList from "../pages/OwnProfileBuddyList";
import BuddyProfileBuddyList from "../pages/BuddyProfileBuddyList";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify token with your backend
        const response = await fetch("http://localhost:5001/api/users/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // If token is invalid, remove it
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/profile-info" element={<ProfileInfo setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/home" />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/buddy/:matchId"
          element={isAuthenticated ? <BuddyProfile /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <OwnProfile /> : <Navigate to="/login" />}
        />
        <Route
          path="/own-profile/buddies"
          element={isAuthenticated ? <OwnProfileBuddyList /> : <Navigate to="/login" />}
        />
        <Route
          path="/buddy-profile/:matchId/buddies"
          element={isAuthenticated ? <BuddyProfileBuddyList /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/create-group"
          element={isAuthenticated ? <CreateGroup /> : <Navigate to="/login" />}
        />
        <Route
          path="/search"
          element={isAuthenticated ? <SearchPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
