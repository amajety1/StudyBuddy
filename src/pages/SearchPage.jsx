import React, { useState } from "react";

import Header from '../components/Header';
import Navbar from '../components/Navbar';
import SearchPageComponent from '../components/SearchPageComponent';    

function SearchPage() {
    return (
        <div>
            <Header/>
            <Navbar/>
            <SearchPageComponent/>
        </div>
    );
}

export default SearchPage;