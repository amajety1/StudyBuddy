import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "../pages/Signup"
import Login from "../pages/Login";
import SignupPword from "../pages/SignupPword";
import ValidateNumber from "../pages/validateNumber";
import ProfileInfo from "../pages/ProfileInfo";
import Home from "../pages/Home";
import BuddyProfile from "../pages/BuddyProfile";
import OwnProfile from "../pages/OwnProfile";
import ChatPage from "../pages/ChatPage";
import CreateGroup from "../pages/CreateGroup";
import SearchPage from "../pages/SearchPage";

function App() {

  // You can manage authentication state here
  const isAuthenticated = true; // Replace with your auth logic

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup-password" element={<SignupPword />} />
        <Route path="/validate-number" element={<ValidateNumber />} />
        <Route path="/profile-info" element={<ProfileInfo />} />

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

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;