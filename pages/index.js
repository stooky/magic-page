"use client";

import React, { useState, useEffect } from 'react';
import { callZapierWebhook } from '../components/utils/zapier';
import { SCREEN_STATES } from '../configuration/screenStates';
import FormComponent from '../components/FormComponent';
import LoadingComponent from '../components/LoadingComponent';
import ScanningComponent from '../components/ScanningComponent';
import valhallah from '../components/valhallah.js';
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
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);  // New state for scanning
    const [messageItems, setMessageItems] = useState(null);
    const [aiListingUrl, setaiListingUrl] = useState('EMPTY');
    const [screenState, setScreenState] = useState(SCREEN_STATES.FORM);
    let sessionID = '';


    // Define the delay function
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));    

    // Function to strip our stuff from the Zapier message
    const processZapierResponse = (response) => {
        const strippedText = response.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
        const items = strippedText.match(/\d+\.\s*(.*?)(?=\d+\.\s*|\s*$)/g).map(item => item.replace(/^\d+\.\s*/, ''));
        return items;
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

    useEffect(() => {
        if (isLoading) {
            setScreenState(SCREEN_STATES.LOADING);
        } else if (isScanning) {
            setScreenState(SCREEN_STATES.SCANNING);
        } else if (aiListingUrl !== 'EMPTY') {
            setScreenState(SCREEN_STATES.CHAT_TEASE);
        } else {
            setScreenState(SCREEN_STATES.FORM);
        }
    }, [isLoading, isScanning, aiListingUrl]);
    
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
                        const processedItems = processZapierResponse(data.response.message); // Process the response
                        setMessageItems(processedItems); // Update state called 'messageItems'
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
    
        return () => clearInterval(pollingInterval);
    }, [loading]);
    
    

    // Looking for our screenshot URL
    useEffect(() => {
        if (screenshotUrl) {
            setIsLoading(false);    // Stop loading screen
            setIsScanning(true);    // Start scanning screen
        }
    }, [screenshotUrl]);



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
        setIsLoading(true); // Show loading screen

        if (!callbackReceived) {
            alert("Please wait until the current request is processed.");
            return;
        }

        await fetch('/api/clear-response', { method: 'POST' });

        sessionID = Math.random().toString(36).substring(2, 8); // Generate random 6 character alphanumeric string
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
                const startTime = Date.now(); /* hard code */
                const pollingInterval = setInterval(async () => {
                    const elapsedTime = Date.now() - startTime; /* hard code */
                    if (Date.now() - startTime > oneMinute) {
                        clearInterval(pollingInterval);
                        console.error('Polling timed out.');
                        return;
                    }

                    myListingUrl = await fetchMyListingUrl(sessionID);


                    //if (myListingUrl && myListingUrl !== 'EMPTY') {
                    console.log('Elapsed time : ', elapsedTime);
                        if (elapsedTime > 20000 ) {
                            try {
                                await axios.post('https://crkid.com/api/dbUpdateVisitor', {
                                    sessionID: sessionID,
                                    myListingUrl: "https://sales.vendasta.com/magic-page-company-jobheating-com-r3mcx89x/"
                                });
                                console.log('Visitor inserted successfully.', sessionID, myListingUrl);
                            } catch (error) {
                                console.error('Error inserting visitor:', error);
                            }
                        clearInterval(pollingInterval);
                        setIframeUrl(myListingUrl);
                        setShowIframe(true);
                        setIsScanning(false); 
                        //setaiListingUrl(myListingUrl);
                        myListingUrl = "https://sales.vendasta.com/magic-page-company-jobheating-com-r3mcx89x/";
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


    return (
        <div className="full-screen-container">
            {screenState === SCREEN_STATES.LOADING ? (
                <LoadingComponent />
            ) : screenState === SCREEN_STATES.SCANNING ? (
                <ScanningComponent screenshotUrl={screenshotUrl} messageItems={messageItems} />
            ) : screenState === SCREEN_STATES.CHAT_TEASE ? (
                <Valhallah aiListingUrl={aiListingUrl} />
            ) : (
                <div className="centered-content">
                    <FormComponent onSubmit={handleSubmit} />
                </div>
            )}

            <style jsx>{`
                .full-screen-container {
                    display: block;
                    height: 100vh;
                    width: 100vw;
                    background: linear-gradient(135deg, #003366 0%, #1a1a73 100%);
                    color: white;
                    padding: 0;
                    margin: 0;
                    box-sizing: border-box;
                }
                .centered-content, .loading-screen {
                    text-align: center;
                    max-width: 100%;
                    padding: 0px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .loading-screen h2 {
                    font-size: 2.5em;
                    margin-bottom: 20px;
                    color: #ffffff;
                }
                .loading-screen img {
                    margin-top: 20px;
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
