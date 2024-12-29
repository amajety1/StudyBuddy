import React, { useState } from "react";

function SignupPword() {
     
    const [fullName, setFullName] = useState("");
    const [extension, setExtension] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState(1);
    const formSubmit = (e) => {
        e.preventDefault();
        console.log(email, password);
    }

     
    return   <div className="login-container">
                <div className="login-image-half"></div>
                <div className="login-text-half">
                    <div className='login-heading-description'>
                        <img src='/images/google.png'></img>
                    </div>
                    <form onSubmit={formSubmit}>
                        <div className="email-form">
                            <label className="noto-sans">Your Name</label>
                            <input
                            className="noto-sans input-box"
                            type="text"
                            placeholder="Full Name"
                            required
                            onChange={(e) => setFullName(e.target.value)}

                            />
                        </div>

                        

                        <div className="phone-form">
                            <h4 className="noto-sans">Phone</h4>
                            <div className="phone-input-container">
                                <select
                                className="noto-sans input-box country-code-dropdown"
                                required
                                onChange={(e) => setExtension(e.target.value)} // Updates the state for the selected code
                                >
                                    <option value="+1">+1 (USA)</option>
                                    <option value="+44">+44 (UK)</option>
                                    <option value="+91">+91 (India)</option>
                                    <option value="+61">+61 (Australia)</option>
                                    <option value="+81">+81 (Japan)</option>
                                    <option value="+49">+49 (Germany)</option>
                                    <option value="+33">+33 (France)</option>
                                    <option value="+86">+86 (China)</option>
                                </select>
                                <input
                                    className="noto-sans input-box phone-number-input"
                                    type="text"
                                    placeholder="Enter your Phone Number"
                                    required
                                    onChange={(e) => setPhoneNumber(e.target.value)} // Updates the state for the phone number
                                />
                            </div>
                        </div>
                        <button  type="submit" className='login-button noto-sans'>Continue</button>
                    </form>
                </div>
            </div>;
};

export default SignupPword;