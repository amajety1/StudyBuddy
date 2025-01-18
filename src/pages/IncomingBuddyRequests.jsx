import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import IncomingBuddyRequestsComponent from '../components/IncomingBuddyRequestsComponent';

function IncomingBuddyRequests() {
    return (
        <div>
            <Header />
            <Navbar />
            <div className="buddy-list-container">
                <IncomingBuddyRequestsComponent />
            </div>
        </div>
    );
}

export default IncomingBuddyRequests;
