import React, { useEffect, useState } from 'react';
import '../src/css/main.css';
import '../src/css/mockbox.css';
import '../src/css/thumbnail.css';
import '../src/css/ai_agent.css';
import '../src/css/weird_stuff.css';
import '../src/css/style.css';

export default function Valhallah({ aiListingUrl }) {
    const [showChat, setShowChat] = useState(false);

    const handleShowChat = () => {
        setShowChat(true);
    };

    return (
        <div className="full-screen-container">
            {!showChat ? (
                <div className="preview-screen">
                    <h1>Your AI Agent is ready!</h1>
                    <button className="try-button" onClick={handleShowChat}>
                        Give it a try!
                    </button>
                    <div className="footer">
                        <p>Powered by <b>VENDASTA</b></p>
                        <p>Copyright © 2024  |  Privacy Policy  |  Legal</p>
                    </div>
                </div>
            ) : (
                <div className="iframe-container">
                    <iframe 
                        src={aiListingUrl}  // Using the passed myListingUrl prop
                        title="AI Chat Interface"
                        className="full-screen-iframe"
                        frameBorder="0"
                    />
                    <div className="actions">
                        <button className="action-button">Get a Demo</button>
                        <button className="action-button">Get a Snapshot</button>
                    </div>
                </div>
            )}
        </div>
    );
}
