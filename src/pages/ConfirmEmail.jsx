import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ConfirmEmail() {
  const [verificationCode, setVerificationCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { email, verificationCode: expectedCode } = location.state;

  const formSubmit = async (e) => {
    e.preventDefault();

    if (verificationCode !== expectedCode) {
      setErrorMessage("Invalid verification code.");
      setVerificationCode("");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/users/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("User verified successfully:", data);
        navigate("/profile-info",{ state: { email} });
      } else {
        setErrorMessage(data.error || "An error occurred during verification.");
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-half"></div>
      <div className="login-text-half">
        <div className="login-heading-description">
          <img src="/images/google.png" alt="Logo" />
        </div>
        <form onSubmit={formSubmit}>
          <div className="email-form">
            <label className="noto-sans">Enter Verification Code</label>
            <input
              className="noto-sans input-box"
              type="text"
              placeholder="6-digit code"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="login-button noto-sans">
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConfirmEmail;
