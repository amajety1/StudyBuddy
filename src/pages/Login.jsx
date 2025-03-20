import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Import CSS file

function Login({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [animationKey, setAnimationKey] = useState(0); // To restart animation
  const navigate = useNavigate();

  // Restart animation when the page is mounted
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid credentials");

      // Store token & authenticate user
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      navigate("/home");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div key={animationKey} className="login-page">
      <div className="login-card">
        <h1>Log In</h1>
        <p>Welcome back! Please enter your details.</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>

          <button type="button" className="google-button">
            <img src="/images/google.png" alt="Google" className="google-icon" />
            Log in with Google
          </button>

          <p className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </p>

          <p className="switch-page">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
