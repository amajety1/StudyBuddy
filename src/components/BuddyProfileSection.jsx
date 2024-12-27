import React, { useState } from "react";
import Matches from "./Matches";

function BuddyProfileSection() {
    return (
        <div className="buddy-profile">
            <div className="buddy-profile-name-github-courses-left-half">
                <div className="profile-buddy-headshot-adjust">
                    <img src="/images/luigi-profile-buddy.jpeg"></img> 
                    
                </div>
                <div className="buddy-profile-name-backdrop-connect">
                    <div className="profile-backdrop">
                        <img src="/images/profile-backdrop-img.jpg"></img>
                    </div>
                    <div className="buddy-profile-links">
                        <img src="/images/github-icon.png"></img>  
                        <img src="/images/buddies-confirmed.png"></img> 
                    </div>
                    <div className="buddy-profile-name-brief-about-major-degree">
                        <div className="buddy-profile-brief-name">
                            <h3 className="noto-sans">Luigi Mangioni</h3>
                            <p className="noto-sans">McDonalds Enthusiast</p>
                        </div>
                        <div className="buddy-profile-brief-edu">
                            <h3 className="noto-sans">Computer Science</h3>
                            <p className="noto-sans">BS</p>
                            <div className="buddy-profile-line"></div>
                        </div>
                    </div>
                </div>
                <div className="buddy-profile-about-github">
                    <h3>About</h3>
                    <p>💼 My background in software engineering was going great until I decided to take my frustrations with the healthcare system to an extreme level. Note to self: stalking and shooting CEOs is not the best way to get your voice heard! 😅</p>                    
                    <div className="buddy-profile-line"></div>
                </div>
                <div className="buddy-profile-courses">
                    <h3 className="noto-sans">Courses</h3>
                    <div className="buddy-profile-current-course-and-label">
                        <h5 className="noto-sans">Current Courses</h5>
                        <div className="buddy-profile-current-courses">
                            <div className="buddy-profile-current-course-card">CSC 1302</div>
                            <div className="buddy-profile-current-course-card">MATH 2212</div>
                            <div className="buddy-profile-current-course-card">PERS 2001</div>
                        </div>
                    </div>
                    <div className="buddy-profile-previous-course-and-label">
                        <h5 className="noto-sans">Previous Courses</h5>
                        <div className="buddy-profile-previous-courses">
                            <div className="buddy-profile-previous-course-card">MATH 1113</div>
                            <div className="buddy-profile-previous-course-card">CSC 1301</div>
                            <div className="buddy-profile-previous-course-card">ENGL 1101</div>
                        </div>
                    </div>

                </div>

                <div className="buddy-profile-book-study-session">
                    <h3 className="noto-sans">Book Study Session</h3>
                    <h4 className="noto-sans">Available sessions</h4>
                    <div className="study-session-cards">
                        <div className="buddy-profile-session-card">
                            <h6 className="noto-sans">Date: 12/24/2023</h6>
                            <h6 className="noto-sans">Time: 5:00 PM</h6>
                            <h6 className="noto-sans">Online</h6>
                        </div>
                        <div className="buddy-profile-session-card">
                            <h6 className="noto-sans">Date: 12/24/2023</h6>
                            <h6 className="noto-sans">Time: 5:00 PM</h6>
                            <h6 className="noto-sans">Online</h6>
                        </div>
                        <div className="buddy-profile-session-card">
                            <h6 className="noto-sans">Date: 12/24/2023</h6>
                            <h6 className="noto-sans">Time: 5:00 PM</h6>
                            <h6 className="noto-sans">Online</h6>
                        </div>
                        <div className="buddy-profile-session-card">
                            <h6 className="noto-sans">Date: 12/24/2023</h6>
                            <h6 className="noto-sans">Time: 5:00 PM</h6>
                            <h6 className="noto-sans">Online</h6>
                        </div>
                    </div>
                    


                </div>
            </div>
            <div className="buddy-profile-buddy-suggestions-right-half">
                <Matches/>
                
            </div>
            
        </div>
    )
}

export default BuddyProfileSection;