import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import OutgoingBuddyRequestsComponent from '../components/OutgoingBuddyRequestsComponent';

function OutgoingBuddyRequests() {
    return (
        <div>
            <Header />
            <Navbar />
            <div className="buddy-list-container">
                <OutgoingBuddyRequestsComponent />
            </div>
        </div>
    );
}

export default OutgoingBuddyRequests;
