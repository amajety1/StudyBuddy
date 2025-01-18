import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import OwnProfileBuddyListComponent from '../components/OwnProfileBuddyListComponent';

function OwnProfileBuddyList() {
    return (
        <div>
            <Header />
            <Navbar />
            <div className="buddy-list-container">
                <OwnProfileBuddyListComponent />
            </div>
        </div>
    );
}

export default OwnProfileBuddyList;