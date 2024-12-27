import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Matches from "../components/Matches";
import Messages from "../components/Messages";
import BuddyProfileSection from "../components/BuddyProfileSection";
import OwnProfileSection from '../components/OwnProfileSection';

function OwnProfile() {
    return (
        <div>
            <Header/>
            <Navbar/>
            <OwnProfileSection/>    
            <Messages/>
            
            
            
        </div>
    );
}

export default OwnProfile;