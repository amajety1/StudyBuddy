import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginSignup.css"; // Import the CSS file

const LoginSignup = ({ setIsAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password validation function
  const isPasswordValid = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  // Toggle between Login and Signup form
  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { firstName, lastName, email, password, confirmPassword } = formData;

    // Validation
    if (!email || !password || (!isLogin && (!firstName || !lastName || !confirmPassword))) {
      setErrorMessage("All fields are required.");
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!isLogin && !isPasswordValid(password)) {
      setErrorMessage("Password must be at least 8 characters, include one uppercase letter, one number, and one lowercase letter.");
      setLoading(false);
      return;
    }

    try {
      const url = isLogin
        ? "http://localhost:5001/api/users/login"
        : "http://localhost:5001/api/users/signup";

      const body = isLogin
        ? { email, password }
        : { firstName, lastName, email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "An error occurred");

      if (isLogin) {
        localStorage.setItem("token", data.token);
        setIsAuthenticated(true);
        navigate("/home");
      } else {
        setSuccessMessage("User created successfully.");
        localStorage.setItem("email", email);
        navigate("/confirm-email", { state: { email, verificationCode: data.verificationCode } });
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${!isLogin ? "active" : ""}`}>
      <div className="form-box">
        <form onSubmit={handleSubmit}>
          <h1>{isLogin ? "Log In" : "Sign Up"}</h1>
          <p>{isLogin ? "Welcome back! Please enter your details to continue." : "Create an account to get started."}</p>

          {!isLogin && (
            <>
              <div className="input-box">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <i className="bx bxs-user"></i>
              </div>
              <div className="input-box">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                <i className="bx bxs-user"></i>
              </div>
            </>
          )}

          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <i className="bx bxs-envelope"></i>
          </div>

          <div className="input-box">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <i className="bx bxs-lock-alt"></i>
          </div>

          {!isLogin && (
            <div className="input-box">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <i className="bx bxs-lock-alt"></i>
            </div>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? (isLogin ? "Logging in..." : "Signing up...") : isLogin ? "Log In" : "Sign Up"}
          </button>

          <button type="button" className="google-button">
            <img src="/images/google.png" alt="Google" className="google-icon" />
            {isLogin ? "Log in with Google" : "Sign up with Google"}
          </button>

          {isLogin ? (
            <div className="login-links">
              <a href="/forgot-password">Forgot Password?</a>
              <span> | </span>
              <a href="#" onClick={toggleForm}>Don't have an account? Sign Up</a>
            </div>
          ) : (
            <div className="login-links">
              <a href="#" onClick={toggleForm}>Already have an account? Log In</a>
            </div>
          )}
        </form>
      </div>

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button type="button" className="btn toggle-btn" onClick={toggleForm}>Register</button>
        </div>

        <div className="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button type="button" className="btn toggle-btn" onClick={toggleForm}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
