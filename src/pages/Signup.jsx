import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css"; // Import CSS file

function Signup() {
  const [animationKey, setAnimationKey] = useState(0); // Key to trigger animation
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Restart animation whenever this page is mounted
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Password validation function
  const isPasswordValid = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  // Handle form submission
  const formSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const { firstName, lastName, email, password, confirmPassword } = formData;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!isPasswordValid(password)) {
      setErrorMessage("Password must be at least 8 characters, include one uppercase letter, one number, and one lowercase letter.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5001/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("User created successfully.");
        localStorage.setItem("email", email);
        navigate("/confirm-email", { state: { email, verificationCode: data.verificationCode } });
      } else {
        setErrorMessage(data.error || "An error occurred.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div key={animationKey} className="signup-page">
      <div className="signup-card">
        <h1>Sign Up</h1>
        <p>Create your account below.</p>
        <form onSubmit={formSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
          <p className="switch-page">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
