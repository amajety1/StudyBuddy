import React, { useState } from "react";

function validateNumber() {
     
    const [userCode, setUserCode] = useState("");
   
    const codeSubmit = (e) => {
        e.preventDefault();
        console.log(userCode);
    }

     
    return   <div className="login-container">
                <div className="login-image-half"></div>
                <div className="login-text-half">
                    <div className='login-heading-description'>
                        <p className="noto-sans">Please enter the code sent to your phone number</p>
                    </div>
                    <form onSubmit={codeSubmit}>
                        <div className="email-form">
                            <input
                            className="noto-sans input-box"
                            type="text"
                            placeholder="Verification Code"
                            required
                            onChange={(e) => setUserCode(e.target.value)}

                            />
                        </div>


                        <button  type="submit" className='login-button noto-sans'>Continue</button>
                    </form>
                    
                

                </div>
            </div>;
};

export default validateNumber;