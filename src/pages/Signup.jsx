import React, { useState } from "react";

function Signup() {
     
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const formSubmit = (e) => {
        e.preventDefault();
        console.log(email, password);
    }

     
    return   <div className="login-container">
                <div className="login-image-half"></div>
                <div className="login-text-half">
                    <div className='login-heading-description'>
                        <h1 className="noto-sans">Sign Up</h1>
                    </div>
                    <form onSubmit={formSubmit}>
                        <div className="email-form">
                            
                            <input
                            className="noto-sans input-box"
                            type="text"
                            placeholder="Email or Username"
                            required
                            onChange={(e) => setEmail(e.target.value)}

                            />
                        </div>

                        
                        

                        <button  type="submit" className='login-button noto-sans'>Sign Up</button>
                        <button type="submit" className='google-button noto-sans'>
                          <img src="/images/google.png" alt="Google Icon" style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                          <p>Sign Up with Google</p>
                        </button>

                        
                        <div className="no-account">
                                <a
                                href="/login"
                                className="noto-sans"
                                >
                                Already have an account?
                                </a>
                        </div>
                    </form>
                    
                

                </div>
            </div>;
};

export default Signup;