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
            console.log('Calling Zapier Webhook');
            const screenshotResponse = await fetch(`/api/get-screenshot?url=${encodeURIComponent(website)}`);
            const screenshotData = await screenshotResponse.json();
            if (screenshotData.screenshotUrl) {
                setScreenshotUrl(screenshotData.screenshotUrl);
                console.log('Thumbnail successfully captured and generated.');
            } else {
                console.error('Error fetching screenshot:', screenshotData.error);
            }

            const response = await callZapierWebhook(email, website);
            console.log('Zapier Response:', response);  // Log the full response
            setZapierResponse(response);

            const companyName = response && response.message ? extractCompanyName(response.message, website) : `magic-page-company-${website.replace(/^https?:\/\//, '').replace(/\./g, '-')}`;
            console.log("Extracted Company Name: " + companyName);

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

            console.log('Calling Vendasta Automation API');

            const vendastaAutomationResponse = await fetch('/api/vendasta-automation-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, website, company: companyName, sessionID })
            });
            const vendastaAutomationData = await vendastaAutomationResponse.json();
            console.log('Vendasta Automation API Response:', vendastaAutomationData);
            
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
                <>
                    <h1>Generate leads while you sleep</h1>
                    <div className="description">
                        Turn your website visitors into leads with a custom AI Agent built with ChatGPT
                    </div>
                </>
            )}
            {formVisible ? (
                <FormComponent onSubmit={handleSubmit} />
            ) : (
                <div className="building-message">
                    Building AI Employee for {enteredWebsite}
                    {showIframe ? ( 
                        <div className="ai-employee-message"> <!-- Highlight this block -->
                            Here is your AI Employee
                            <div className="arrow">--&gt;</div>
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
            {showPoll && (
                <PollComponent
                    currentScreen={currentScreen}
                    currentScreenIndex={currentScreenIndex}
                    responses={responses}
                    handleOptionChange={handleOptionChange}
                />
            )}
        </div>
        <div className="info-section">
            <div className="thumbnail-container"> <!-- Highlight this block -->
                <InfoDisplayComponent
                    screenshotUrl={screenshotUrl}
                    showIframe={showIframe}
                    iframeUrl={iframeUrl}
                />
                <div className="overlay-gif">
                    <img src={gifPath} alt="Overlay GIF" />
                </div>
            </div> <!-- End of the highlighted block -->
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                padding: 20px;
                font-family: Arial, sans-serif;
                color: #000;
                background-color: #fff;
                min-height: 100vh;
            }
            .interaction-section {
                flex: 1;
                padding-right: 10px;
            }
            .info-section {
                flex: 1;
                padding-left: 10px;
                position: relative;
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
            .ai-employee-message { <!-- Highlight this block -->
                margin-top: 20px;
                font-family: sans-serif;
                font-size: 48px;
                color: #FF0000; /* Appealing red color */
                font-weight: bold;
            }
            .arrow {
                font-size: 48px;
                color: #FF0000; /* Appealing red color */
                font-weight: bold;
            } <!-- End of the highlighted block -->
            .thumbnail-container {
                position: relative;
                display: inline-block;
            }
            .overlay-gif { <!-- Highlight this block -->
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                pointer-events: none; /* Makes the GIF not interactable */
            }
            .overlay-gif img {
                max-width: 100%;
                max-height: 100%;
            } <!-- End of the highlighted block -->
        `}</style>
    </div>
    );
};    

export default MainContainer;
