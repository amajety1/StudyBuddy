import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Matches from "../components/Matches";
import Messages from "../components/Messages";
import BuddyProfileSection from "../components/BuddyProfileSection";

function BuddyProfile() {
    return (
        <div>
            <Header/>
            <Navbar/>
            <BuddyProfileSection/>
                
                <Messages/>
            
            
            
        </div>
    );
}

export default BuddyProfile;