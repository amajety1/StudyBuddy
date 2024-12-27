import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Matches from "../components/Matches";
import Messages from "../components/Messages";
import BuddyProfileSection from "../components/BuddyProfileSection";
import OwnProfileSection from '../components/OwnProfileSection';
import CreateGroupComponent from '../components/CreateGroupComponent';

function CreateGroup() {
    return (
        <div>
            <Header/>
            <Navbar/>
            <CreateGroupComponent/>
            
        </div>
    );
}

export default CreateGroup;