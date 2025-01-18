import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import BuddyProfileBuddyListComponent from '../components/BuddyProfileBuddyListComponent';

function BuddyProfileBuddyList() {
    return (
        <div>
            <Header />
            <Navbar />
            <div className="buddy-list-container">
                <BuddyProfileBuddyListComponent />
            </div>
        </div>
    );
}

export default BuddyProfileBuddyList;