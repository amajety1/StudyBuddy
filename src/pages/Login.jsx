import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";


function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const formSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);

        // Store the token in localStorage
        localStorage.setItem("token", data.token);

        // Update authentication state
        setIsAuthenticated(true);

        // Navigate to the home page
        navigate("/home");
      } else {
        setErrorMessage(data.error || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-half"></div>
      <div className="login-text-half">
        <div className="login-heading-description">
          <h1 className="noto-sans">Log in</h1>
        </div>
        <form onSubmit={formSubmit}>
          <div className="email-form">
            <input
              className="noto-sans input-box"
              type="text"
              placeholder="Email or Username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="password-form">
            <input
              className="noto-sans input-box"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button type="submit" className="login-button noto-sans">
            Log in
          </button>

          <button type="button" className="google-button noto-sans">
            <img
              src="/images/google.png"
              alt="Google Icon"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            <p>Log in with Google</p>
          </button>

          <div className="forgot-password">
            <a href="/forgot-password" className="noto-sans">
              Forgot Password?
            </a>
          </div>
          <div className="no-account">
            <a href="/signup" style={{ cursor: "pointer" }} className="noto-sans">
              Don't have an account?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
