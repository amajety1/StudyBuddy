import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import ProfileInfo from "../pages/ProfileInfo";
import Home from "../pages/Home";
import BuddyProfile from "../pages/BuddyProfile";
import OwnProfile from "../pages/OwnProfile";
import ChatPage from "../pages/ChatPage";
import CreateGroup from "../pages/CreateGroup";
import SearchPage from "../pages/SearchPage";
import ConfirmEmail from "../pages/ConfirmEmail";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // This effect ensures the authentication state is updated if `localStorage` changes
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile-info" element={<ProfileInfo setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/home" />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/buddy-profile/:id"
          element={isAuthenticated ? <BuddyProfile /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <OwnProfile /> : <Navigate to="/login" />}
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
        <Route
          path="/confirm-email"
          element={<Navigate to="/confirm-email" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
