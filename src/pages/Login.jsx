import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


function Login() {
   
    
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
                        <h1 className="noto-sans">Log in</h1>
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

                        <div className="password-form">
                            
                            <input
                            className="noto-sans input-box"
                            type="password"
                            placeholder="Password"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        

                        <button  type="submit" className='login-button noto-sans'>Log in</button>
                        <button type="submit" className='google-button noto-sans'>
                          <img src="/images/google.png" alt="Google Icon" style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                          <p>Log in with Google</p>
                        </button>

                        <div className="forgot-password">
                                <a
                                href="/forgot-password"
                                className="noto-sans"
                                >
                                Forgot Password?
                                </a>
                        </div>
                        <div className="no-account" >
                                <a
                                href="/signup"
                                style={{cursor:'pointer'}}
                                className="noto-sans"
                                >
                                Don't have an account?
                                </a>
                        </div>
                    </form>
                    
                

                </div>
            </div>;
};

export default Login;