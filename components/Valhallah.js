import React, { useEffect, useState } from 'react';
import '../src/css/main.css';
import '../src/css/mockbox.css';
import '../src/css/thumbnail.css';
import '../src/css/ai_agent.css';
import '../src/css/weird_stuff.css';
import '../src/css/style.css';

    // New functions for button actions
    const handleGetDemo = () => {
        window.location.href = 'https://vendasta.com/request-demo/';
    };

    const handleTryForFree = () => {
        window.location.href = 'https://signup.vendasta.com/';
    };

export default function Valhallah({ aiListingUrl }) {
    const [showChat, setShowChat] = useState(false);

    const handleShowChat = () => {
        setShowChat(true);
    };

    return (
        <div className="magic_mock_ai_body">
            {!showChat ? (
                <div className="preview-screen">
                    {/* The iframe is now added to the preview screen */}
                    <iframe
                        src={aiListingUrl}
                        title="AI Chat Interface"
                        className="full-screen-iframe"
                        frameBorder="0"
                        style={{ zIndex: 0 }}  // Ensure iframe is behind other elements
                    />
                    <div className="mock-ai-ready">
                        <h1>Your AI Agent is ready!</h1>
                        <button className="try-button" onClick={handleShowChat}>Give it a try!</button>
                    </div>
                </div>
            ) : (
                <div className="iframe-container">
                    <iframe
                        src={aiListingUrl}
                        title="AI Chat Interface"
                        className="full-screen-iframe"
                        frameBorder="0"
                    />
                 </div>
            )}
            <div className="ai_agent_header">
                <p className="foot_logo"> 
                    <i> Powered by </i>
                    <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 653.1 98.47" style={{width: '130px', height: '30px'}}>
                        <style>
                            {`
                                .cls-logo-3 {
                                    fill: #3F9B63;
                                }
                                .cls-logo-2 {
                                    fill: #fff;
                                }
                            `}
                        </style>
                        <path className="cls-logo-3" d="M151.51 49.94h-2.94v3.9c-.08 25.33-1.12 59.89 12.61 86.33.62 1.21 1.26 2.41 2 3.58a16.83 16.83 0 0 0 5.25-12.21V66.81a16.88 16.88 0 0 0-16.92-16.87ZM144.29 144.53c-19.07-10.25-40.47-20.92-70.5-23.1-1.29-.1-2.56-.22-3.89-.27v10.38a16.88 16.88 0 0 0 16.87 16.88h64.74ZM86.77 49.94A16.88 16.88 0 0 0 69.9 66.81v42.81c1.25-.43 2.55-.93 3.89-1.48 15.73-6.42 38.12-21.08 64.63-54.3q1.52-1.91 3.06-3.9Z" transform="translate(-69.9 -49.94)"></path>
                        <path className="cls-logo-2" d="M183.34 61.3h11.87l22.26 61.64h.22L240.8 61.3H252l-29.86 75.77h-9.63ZM259 61.3h48.91v9.63h-38.64v22.58h36v9.63h-36v24.3h40.56v9.63H259ZM320.1 61.3h13.49l41.74 62.28h.21V61.3h10.28v75.77h-13.06l-42.17-62.29h-.21v62.29H320.1ZM399.3 61.3h26.43a48.8 48.8 0 0 1 14.08 1.82A37.55 37.55 0 0 1 450.29 68a31.2 31.2 0 0 1 7.39 7 37.32 37.32 0 0 1 4.65 8.13 41.75 41.75 0 0 1 2.47 8.35 44.65 44.65 0 0 1 .74 7.7 38.1 38.1 0 0 1-2.67 14.07 35.61 35.61 0 0 1-7.92 12.1 39.09 39.09 0 0 1-13 8.51 46.83 46.83 0 0 1-17.95 3.21h-24.7Zm10.27 66.14h12.95a42.31 42.31 0 0 0 12.36-1.77 30 30 0 0 0 10.22-5.3 25.27 25.27 0 0 0 7-8.83 28 28 0 0 0 2.57-12.36 37.24 37.24 0 0 0-1.18-8.51 25.47 25.47 0 0 0-4.49-9.25 26.29 26.29 0 0 0-9-7.42q-5.78-3.06-15-3h-15.43ZM508.14 62.07l-.39-.94h-9l-.41.92-31.84 73-.94 2.14H476l.4-.93 7.85-18.45h36.61l7.55 18.43.39.95h11l-.89-2.12Zm-19.91 46.47L502.9 74l14.22 34.5ZM584 98.92a45.58 45.58 0 0 0-9.38-3.57 73 73 0 0 1-8.89-2.93 18 18 0 0 1-6.42-4.28c-1.57-1.65-2.37-4.12-2.37-7.34a11.52 11.52 0 0 1 1.18-5.38 11.16 11.16 0 0 1 3.13-3.77 14.35 14.35 0 0 1 4.7-2.32 20.85 20.85 0 0 1 5.86-.81 16.14 16.14 0 0 1 7.49 1.63 16 16 0 0 1 5.49 4.94l.89 1.25 1.24-.9 5.88-4.22 1.2-.92-.95-1.24a22.54 22.54 0 0 0-9.44-7.55A30.18 30.18 0 0 0 572 59.27a31.87 31.87 0 0 0-9.31 1.36 24.57 24.57 0 0 0-8 4.07 19.87 19.87 0 0 0-5.58 6.8 20.3 20.3 0 0 0-2.07 9.3 22.43 22.43 0 0 0 1.73 9.29 18.34 18.34 0 0 0 4.67 6.35 24.85 24.85 0 0 0 6.43 4c2.25 1 4.63 1.86 7 2.63s4.73 1.52 6.88 2.25a30.65 30.65 0 0 1 5.74 2.6 11.39 11.39 0 0 1 3.77 3.59 9.92 9.92 0 0 1 1.36 5.46 11.87 11.87 0 0 1-1.14 5.25 12.13 12.13 0 0 1-3.11 4 14.72 14.72 0 0 1-4.72 2.62 18 18 0 0 1-5.9.94 19 19 0 0 1-9-2.09 15.91 15.91 0 0 1-6.34-6.32l-.82-1.4-1.36.9-6.49 4.33-1.32.88.93 1.28a25.89 25.89 0 0 0 11.06 9 36.12 36.12 0 0 0 13.91 2.64 29.15 29.15 0 0 0 9-1.41 23.18 23.18 0 0 0 7.77-4.25 20.79 20.79 0 0 0 5.4-6.95 21.38 21.38 0 0 0 2-9.42c0-4.85-1-8.74-3.08-11.56a21.1 21.1 0 0 0-7.41-6.49Z" transform="translate(-69.9 -49.94)"></path>
                        <path className="cls-logo-2" d="M588.01 20.43v-9.24h-59.75v9.24h24.95v66.79h9.86V20.43h24.94z"></path>
                        <path className="cls-logo-2" d="m722.11 135-30.72-73-.39-.94h-9l-.39.92-31.86 73-.93 2.14h10.46l.4-.93 7.85-18.45h36.61l7.54 18.43.4.95h11Zm-50.63-26.5L686.15 74l14.22 34.5Z" transform="translate(-69.9 -49.94)"></path>
                    </svg>
                </p>
                <div>
                    {/* Update button text and links */}
                    <button className="action-button btn_dark" onClick={handleGetDemo}>Get a Demo</button>
                    <button className="action-button btn_light" onClick={handleTryForFree}>Try for Free</button>
                </div>
            </div>


            <div className="ai_agent_footer">
                <p> Copyright © 2024    |    Privacy Policy    |    Legal </p>
            </div>
        </div>
    );
}