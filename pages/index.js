"use client";

import React, { useState, useEffect } from 'react';
import { callZapierWebhook } from '../components/utils/zapier';
import screensConfig from '../configuration/screensConfig';
import FormComponent from '../components/FormComponent';
import PollComponent from '../components/PollComponent';
import StaticMarketingComponent from '../components/StaticMarketingComponent';
import InfoDisplayComponent from '../components/InfoDisplayComponent';
import axios from 'axios';


const MainContainer = () => {
    const [loading, setLoading] = useState(false);
    const [callbackReceived, setCallbackReceived] = useState(true);
    const [zapierResponse, setZapierResponse] = useState(null);
    const [screenshotUrl, setScreenshotUrl] = useState(null);
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const [responses, setResponses] = useState({});
    const [showPoll, setShowPoll] = useState(false);
    const [iframeUrl, setIframeUrl] = useState('');
    const [showIframe, setShowIframe] = useState(false);
    const [formVisible, setFormVisible] = useState(true);
    const [enteredWebsite, setEnteredWebsite] = useState('');
    const [messages, setMessages] = useState([]); // Hold parsed messages from Zapier
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0); // Keep track of where we are in the message index
    const gifPath = process.env.NEXT_PUBLIC_GIF_PATH; // Highlight this line

    // Define the delay function
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));    

    // Function to strip our stuff from the Zapier message
    const processZapierResponse = (response) => {
        const strippedText = response.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
        const messageItems = strippedText.match(/\d+\.\s*(.*?)(?=\d+\.\s*|\s*$)/g).map(item => item.replace(/^\d+\.\s*/, ''));
        return messageItems;
    };

    
    // Function to get myListingUrl from the database using sessionID
    async function fetchMyListingUrl(sessionID) {
        try {
            const response = await axios.get('https://crkid.com/api/dbGetVisitor', {
                params: { sessionID: sessionID }
            });
    
            if (response.status === 200) {
                const myListingUrl = response.data.data.mylistingurl;
                console.log('My Listing URL:', myListingUrl);
                // Use the myListingUrl variable in your program
                return myListingUrl;
            } else {
                console.error('No data found for the given sessionID');
                return null;
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
            return null;
        }
    }

    // Loop through our messages.
    useEffect(() => {
        if (messages.length > 0) {
            const interval = setInterval(() => {
                setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
            }, 5000); // Change message every 5 seconds
    
            return () => clearInterval(interval);
        }
    }, [messages]);

    
    useEffect(() => {
        let pollingInterval;
        if (loading) {
            setCallbackReceived(false);
            pollingInterval = setInterval(async () => {
                try {
                    const response = await fetch('/api/get-latest-response');
                    const data = await response.json();
                    if (data.response && data.response.status) {
                        setZapierResponse(data.response);
                        const messageItems = processZapierResponse(data.response.message);
                        setMessages(messageItems);
                        setLoading(false);
                        setCallbackReceived(true);
                        clearInterval(pollingInterval);
                        setShowPoll(false);
                    }
                } catch (error) {
                    console.error('Error polling latest response:', error);
                }
            }, 2000);
        }
    
        // Cleanup function to clear interval on component unmount
        return () => clearInterval(pollingInterval);
    }, [loading]);
    




    const handleOptionChange = (option) => {
        setResponses({
            ...responses,
            [currentScreenIndex]: option
        });
        if (currentScreenIndex < screensConfig.length - 1) {
            setCurrentScreenIndex(currentScreenIndex + 1);
        } else {
            setShowPoll(false); // End of poll questions, hide the poll
        }
    };

    const extractCompanyName = (message, website) => {
        if (message) {
            const match = message.match(/--(.+?)--/);
            if (match) {
                return match[1].trim();
            }
        }
        // Remove "http://" or "https://"
        const cleanedWebsite = website.replace(/^https?:\/\//, '');
        return `magic-page-company-${cleanedWebsite.replace(/\./g, '-')}`;
    };



    const handleSubmit = async (email, website) => {
        if (!email || !website || !email.includes('@') || !website.startsWith('http')) {
            alert("Please enter a valid email and website URL.");
            return;
        }

        setZapierResponse(null);
        setScreenshotUrl(null);
        setEnteredWebsite(website);
        setFormVisible(false); // Hide the form and show the message

        if (!callbackReceived) {
            alert("Please wait until the current request is processed.");
            return;
        }

        await fetch('/api/clear-response', { method: 'POST' });

        const sessionID = Math.random().toString(36).substring(2, 8); // Generate random 6 character alphanumeric string
        console.log('Generated sessionID:', sessionID);


        setLoading(true); // Ensure loading is set to true
        setShowPoll(true);

        try {
            console.log('Calling Vendasta Automation API');
            let companyName = website;
            const vendastaAutomationResponse = await fetch('/api/vendasta-automation-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, website, company: companyName, sessionID })
            });
            //const vendastaAutomationData = await vendastaAutomationResponse.json();
            //console.log('Vendasta Automation API Response:', vendastaAutomationData);
            
            console.log('Calling Screenshot');
            const screenshotResponse = await fetch(`/api/get-screenshot?url=${encodeURIComponent(website)}`);
            const screenshotData = await screenshotResponse.json();
            if (screenshotData.screenshotUrl) {
                setScreenshotUrl(screenshotData.screenshotUrl);
                console.log('Thumbnail successfully captured and generated.');
            } else {
                console.error('Error fetching screenshot:', screenshotData.error);
            }

            // Insert the visitor data into the database
            try {
                await axios.post('/api/dbInsertVisitor', {
                    sessionID: sessionID,
                    email: email,
                    website: website,
                    companyName: companyName,
                    myListingUrl: "EMPTY"
                });
                console.log('Visitor inserted successfully.', sessionID );
            } catch (error) {
                console.error('Error inserting visitor:', error);
            }

            console.log('Calling Zapier Webhook');
            const response = await callZapierWebhook(email, website);
            console.log('Zapier Response:', response);  // Log the full response
            setZapierResponse(response);

            companyName = response && response.message ? extractCompanyName(response.message, website) : `magic-page-company-${website.replace(/^https?:\/\//, '').replace(/\./g, '-')}`;
            console.log("Extracted Company Name: " + companyName);
            
            
            const startTime = Date.now();
            const oneMinute = 170000;

            const pollForMyListingUrl = async () => {
                let myListingUrl = null;
                const pollingInterval = setInterval(async () => {
                    if (Date.now() - startTime > oneMinute) {
                        clearInterval(pollingInterval);
                        console.error('Polling timed out.');
                        return;
                    }

                    myListingUrl = await fetchMyListingUrl(sessionID);

                    if (myListingUrl && myListingUrl !== 'EMPTY') {
                        clearInterval(pollingInterval);
                        setIframeUrl(myListingUrl);
                        setShowIframe(true);
                        console.log('Fetched URL:', myListingUrl);
                    } else {
                        console.log('Waiting for URL to be updated...');
                    }
                }, 5000);
            };

            await pollForMyListingUrl();

        
        } catch (error) {
            console.error('Failed to call the API Stuff:', error);
            setZapierResponse({ status: 'error', message: `Failed to call the API stuff: ${error.message}` });
        }
    };

    const formatResponse = (response) => {
        if (response && response.message) {
            return response.message.replace(/\n/g, '<br />');
        }
        return '';
    };

    const formatErrorResponse = (response) => {
        if (response && response.rawBody) {
            return `<strong>Error:</strong> ${response.message}<br/><br/><strong>Raw Body:</strong><br/>${response.rawBody.replace(/\n/g, '<br />')}`;
        }
        return `<strong>Error:</strong> ${response.message}`;
    };

    const currentScreen = screensConfig[currentScreenIndex];

    return (
        <div className="container">
            <div className="interaction-section">
                {formVisible && (
                    <div className="mock_box">
                        <h2> Unlock the magic of <br/> <span> AI lead capture</span>. <i> Instantly</i>. </h2>
                        <p> No coding needed. Just enter your website and watch the magic happen.</p>
                        <FormComponent onSubmit={handleSubmit} />
                    </div>
                )}
                {!formVisible && (
                    <div className="building-message">
                        Building AI Employee for {enteredWebsite}
                        {showIframe ? (
                            <div className="ai-employee-message">
                                Here is your AI Employee
                                <div className="arrow">
                                    <img src="/images/aiemp.webp" width="300" alt="AI Employee" />
                                </div>
                            </div>
                        ) : (
                            zapierResponse && (
                                <div className="response">
                                    {messages.length > 0 && (
                                        <div>
                                            {messages.map((message, index) => (
                                                <div
                                                    key={index}
                                                    style={{ display: index === currentMessageIndex ? 'block' : 'none', transition: 'opacity 1s' }}
                                                >
                                                    {message}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )}
                {!showIframe && showPoll && (
                    <PollComponent
                        currentScreen={currentScreen}
                        currentScreenIndex={currentScreenIndex}
                        responses={responses}
                        handleOptionChange={handleOptionChange}
                    />
                )}
            </div>
            <div className="info-section">
                <div className="thumbnail-container">
                    <InfoDisplayComponent
                        screenshotUrl={screenshotUrl}
                        showIframe={showIframe}
                        iframeUrl={iframeUrl}
                    />
                </div>
            </div>
            <style jsx>{`
                .container {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    padding: 0; /* Remove padding to allow full screen coverage */
                    font-family: Arial, sans-serif;
                    color: #fff; /* Ensure text is white to stand out against the blue background */
                    background-color: #003366; /* Match the blue background color */
                    min-height: 100vh; /* Ensure the container fills the viewport height */
                }
                .interaction-section {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    flex: 1;
                    padding: 20px;
                    background-color: #003366; /* Match the blue background color */
                    color: #fff; /* Text color to ensure readability */
                    height: 100vh; /* Full viewport height */
                }
                .info-section {
                    flex: 1;
                    padding-left: 10px;
                    position: relative;
                    width: 100%;
                }
                .mock_box {
                    text-align: center;
                    color: white; /* Ensure the text is readable against the blue background */
                    padding: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Optional: adds a shadow for better visual appeal */
                    border-radius: 8px; /* Optional: rounded corners */
                    max-width: 600px; /* Ensure the content doesn't stretch too wide */
                    width: 100%;
                }
                .mock_box h2 {
                    font-size: 2.5em;
                    margin-bottom: 20px;
                }
                .mock_box p {
                    font-size: 1.2em;
                    margin-bottom: 20px;
                }
                .mock_box form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .mock_box input {
                    width: 100%;
                    max-width: 400px;
                    padding: 10px;
                    margin-bottom: 15px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                    box-sizing: border-box;
                    font-size: 1em;
                }
                .mock_box button {
                    padding: 10px 20px;
                    background-color: #ffcc00; /* Button background color */
                    color: #000; /* Button text color */
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1em;
                }
                .mock_box button:hover {
                    background-color: #e6b800; /* Button hover background color */
                }
                .building-message {
                    margin-top: 20px;
                    font-size: 24px; /* Large font size */
                    font-weight: bold; /* Bold font */
                    line-height: 1.5; /* Spacing between lines */
                }
                .response {
                    margin-top: 20px; /* Spacing from the top title */
                    font-family: sans-serif; /* Sans-serif font */
                    font-size: 48px; /* Twice the font size */
                    color: #007BFF; /* Appealing blue color */
                    font-weight: bold; /* Bold font */
                }
                .ai-employee-message {
                    margin-top: 20px;
                    font-family: sans-serif;
                    font-size: 48px;
                    color: #00FF00; /* Appealing green color */
                    font-weight: bold;
                }
                .arrow {
                    font-size: 48px;
                    color: #FF0000; /* Appealing red color */
                    font-weight: bold;
                }
                .thumbnail-container {
                    position: relative;
                    display: inline-block;
                    width: 100%;
                }
                .thumbnail-container iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
    
                /* Responsive Styles */
                @media (max-width: 768px) {
                    .container {
                        flex-direction: column;
                        padding: 10px;
                    }
                    .interaction-section, .info-section {
                        padding: 0;
                        width: 100%;
                    }
                    .building-message, .response, .ai-employee-message {
                        font-size: 18px; /* Adjust font size for smaller screens */
                    }
                    .arrow img {
                        width: 100px; /* Adjust image size for smaller screens */
                    }
                }
            `}</style>
        </div>
    );
    
    
    
};    

/*
                 <div className="overlay-gif">
                    <img src={gifPath} alt="Overlay GIF" />
                </div>
*/

export default MainContainer;
