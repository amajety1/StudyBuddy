import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isPasswordValid = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!isPasswordValid(password)) {
      setErrorMessage(
        "Password must be at least 8 characters, include one uppercase letter, one number, and one lowercase letter."
      );
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

        // ✅ Log OTP (verificationCode) to console
        if (data.verificationCode) {
          console.log("OTP (Verification Code):", data.verificationCode);
        }

        // ✅ Navigate to confirm-email page
        navigate("/confirm-email", {
          state: { email, verificationCode: data.verificationCode },
        });
      } else {
        setErrorMessage(data.error || "An error occurred.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-half"></div>
      <div className="login-text-half">
        <div className="login-heading-description">
          <h1 className="noto-sans">Sign Up</h1>
        </div>
        <form onSubmit={formSubmit}>
          <div className="form-group">
            <input
              className="noto-sans input-box"
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="noto-sans input-box"
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="noto-sans input-box"
              type="email"
              name="email"
              placeholder="Student Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="noto-sans input-box"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="noto-sans input-box"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <div className="form-group">
            <button
              type="submit"
              className="noto-sans submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
          <div className="no-account">
            <a href="/login" className="noto-sans">
              Already have an account?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
