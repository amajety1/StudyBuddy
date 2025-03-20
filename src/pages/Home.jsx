import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Matches from "../components/Matches";
import Messages from "../components/Messages";
import "../styles/Home.css"; // New CSS file for layout fixes

function Home() {
    return (
        <div className="home-container">
            <Header />
            <Navbar />
            <div className="matches-and-messages">
                <Matches />
                <Messages />
            </div>
        </div>
    );
}

export default Home;
