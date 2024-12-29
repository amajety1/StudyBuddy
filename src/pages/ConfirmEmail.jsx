import React, { useState } from "react";

function ConfirmEmail() {
  const [verificationCode, setVerificationCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formSubmit = (e) => {
    e.preventDefault();

    // Example validation for 6-character code
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setErrorMessage("Please enter a valid 6-digit code.");
      return;
    }

    setErrorMessage(""); // Clear error
    console.log("Verification Code Submitted:", verificationCode);

    // Proceed to the next step
    // Example: navigate("/next-page");
    const code =  Math.floor(Math.random() * 1000000);
    
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
