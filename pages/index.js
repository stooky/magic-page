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
        <div className="full-screen-container">
            <div className="centered-content">
                <h2> Unlock the magic of <br/> <span> AI lead capture</span>. <i> Instantly</i>. </h2>
                <p> No coding needed. Just enter your website and watch the magic happen.</p>
                <FormComponent onSubmit={handleSubmit} />
                <div className="footer">
                    <p className="foot_logo"> 
                        <i> Powered by </i>
                        <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 653.1 98.47">
                            {/* SVG paths here */}
                        </svg>
                    </p>
                    <p> Copyright © 2024  &nbsp; | &nbsp;  Privacy Policy &nbsp;  |  &nbsp; Legal </p>
                </div>
            </div>
            <style jsx>{`
                .full-screen-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #003366 0%, #1a1a73 100%);
                    color: white;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .centered-content {
                    text-align: center;
                    max-width: 600px;
                }
                .centered-content h2 {
                    font-size: 2.5em;
                    margin-bottom: 20px;
                    color: #ffffff;
                }
                .centered-content p {
                    font-size: 1.2em;
                    margin-bottom: 20px;
                    color: #c2c2c2;
                }
                .form input {
                    width: 100%;
                    max-width: 400px;
                    padding: 15px;
                    margin-bottom: 15px;
                    border-radius: 5px;
                    border: none;
                    font-size: 1em;
                }
                .form input:focus {
                    outline: none;
                    border: 1px solid #007bff;
                }
                .form button {
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #a445b2, #fa4299);
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1.1em;
                    transition: background 0.3s ease-in-out;
                }
                .form button:hover {
                    background: linear-gradient(135deg, #fa4299, #a445b2);
                }
                .footer {
                    margin-top: 30px;
                    font-size: 0.9em;
                    color: #ccc;
                }
                .foot_logo svg {
                    width: 100px;
                    height: auto;
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
