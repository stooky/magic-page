"use client";

import React, { useState, useEffect } from 'react';
import { callZapierWebhook } from '../components/utils/zapier';
import { SCREEN_STATES } from '../configuration/screenStates';
import FormComponent from '../components/FormComponent';
import LoadingComponent from '../components/LoadingComponent';
import ScanningComponent from '../components/ScanningComponent';
import Valhallah from '../components/Valhallah.js';
import axios from 'axios';


const MainContainer = () => {
    const [loading, setLoading] = useState(false);
    const [callbackReceived, setCallbackReceived] = useState(true);
    const [zapierResponse, setZapierResponse] = useState(null);
    const [screenshotUrl, setScreenshotUrl] = useState(null);
    const [iframeUrl, setIframeUrl] = useState('');
    const [showIframe, setShowIframe] = useState(false);
    const [formVisible, setFormVisible] = useState(true);
    const [enteredWebsite, setEnteredWebsite] = useState('');
    const [messages, setMessages] = useState([]); // Hold parsed messages from Zapier
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0); // Keep track of where we are in the message index
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);  // New state for scanning
    const [messageItems, setMessageItems] = useState(null);
    const [aiListingUrl, setaiListingUrl] = useState('EMPTY');
    const [screenState, setScreenState] = useState(SCREEN_STATES.FORM);
    const [sessionID, setSessionID] = useState('');
    const apiKey = process.env.NEXT_PUBLIC_PDL_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_PDL_API_URL;


    // Function to call People Data Labs API and get the company name
async function getCompanyName(website) {
    

    console.log('apiUrl: ', apiUrl);
    console.log('website: ', website);
    try {

        // Log the API URL, Website, and API Key (for debugging)
        console.log('API Request Details:');
        console.log('API URL: ', apiUrl);
        console.log('Website: ', website);
        console.log('API Key: ', apiKey); // Be cautious about printing sensitive information like API keys.


        // Make the API request
        const response = await axios.get(apiUrl, {
            params: {
                website: website,
                min_likelihood: 5
            },
            headers: {
                'X-Api-Key': apiKey
            }
        });

        // Extract company name and display name from the response
        const { name, display_name } = response.data;

        // Consolidate the names, preferring 'name' first
        const companyName = name || display_name || 'Unknown Company';

        // Log the names to console for debugging
        console.log('Company Name:', companyName);

        // Return the first valid company name, or a default value
        return companyName;

    } catch (error) {
        console.error('Error fetching company name:', error.message);
        return 'Unknown Company';
    }
}

    // Define the delay function
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));    


    // On component mount, check if sessionID exists in localStorage
// On component mount, check if sessionID exists in localStorage
useEffect(() => {
    /*let existingSessionID = localStorage.getItem('sessionID');
    if (existingSessionID) {
        setSessionID(existingSessionID);
        console.log('Existing sessionID:', existingSessionID);
    } else {*/
        const newSessionID = Math.random().toString(36).substring(2, 8);
        localStorage.setItem('sessionID', newSessionID);
        setSessionID(newSessionID);
        console.log('New sessionID:', newSessionID);
    //}
}, []);


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


        setLoading(true); // Ensure loading is set to true

        try {
            console.log('Calling Vendasta Automation API');
            let companyName = await getCompanyName(website);
            console.log('Retrieved Company Name:', companyName);

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
                const startTime = Date.now(); // Hard-coded start time
            
                const poll = async () => {
                    const elapsedTime = Date.now() - startTime;
                    if (elapsedTime > oneMinute) { // Ensure oneMinute is defined
                        clearInterval(pollingInterval);
                        console.error('Polling timed out.');
                        return;
                    }
            
                    myListingUrl = await fetchMyListingUrl(sessionID);
            
                    if (myListingUrl && myListingUrl !== 'EMPTY') {
                        try {
                            await axios.post('https://crkid.com/api/dbUpdateVisitor', {
                                sessionID: sessionID,
                                myListingUrl: myListingUrl
                            });
                            console.log('Visitor inserted successfully.', sessionID, myListingUrl);
                        } catch (error) {
                            console.error('Error inserting visitor:', error);
                        }
                        clearInterval(pollingInterval);
                        setIframeUrl(myListingUrl);
                        setShowIframe(true);
                        setIsScanning(false);
                        setaiListingUrl(myListingUrl);
                        console.log('Fetched URL:', myListingUrl);
                    } else {
                        console.log('Waiting for URL to be updated...');
                    }
                };
            
                const pollingInterval = setInterval(poll, 5000); // Poll every 5 seconds
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


export default MainContainer;
