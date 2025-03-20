import React from 'react'; 
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import IncomingBuddyRequestsComponent from '../components/IncomingBuddyRequestsComponent';
import '../styles/IncomingBuddyRequests.css';

function IncomingBuddyRequests() {
    return (
        <div className="incoming-buddy-requests">
            <Header />
            <Navbar />
            <div className="buddy-list-container">
                <h2 className="buddy-requests-title">Pending Buddy Requests</h2>
                <IncomingBuddyRequestsComponent />
            </div>
        </div>
    );
}

export default IncomingBuddyRequests;
