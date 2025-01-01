import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Matches from "../components/Matches";
import Messages from "../components/Messages";

function Home() {
    return (
        <div>
            <Header/>
            <Navbar/>
            <div className='matches-and-messages'>
                <Matches/>
                <Messages/>
            </div>
            
            
        </div>
    );
}

export default Home;





