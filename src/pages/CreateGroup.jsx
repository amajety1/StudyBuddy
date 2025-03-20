import React from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import CreateGroupComponent from "../components/CreateGroupComponent";
import "../styles/CreateGroup.css"; // Ensure this CSS file exists

const CreateGroup = () => {
    return (
        <div className="create-group-page">
            <Header />
            <Navbar />
            <main className="content-container">
                <section className="card">
                    <h2>📚 Create a New Study Group</h2>
                    <p>Connect with like-minded individuals, share knowledge, and collaborate effectively.</p>
                    <CreateGroupComponent />
                </section>
            </main>
        </div>
    );
};

export default CreateGroup;
