"use client";

import React, { useState, useEffect } from 'react';
import { callZapierWebhook } from '../components/utils/zapier';
import screensConfig from '../configuration/screensConfig';
import FormComponent from '../components/FormComponent';
import PollComponent from '../components/PollComponent';
import StaticMarketingComponent from '../components/StaticMarketingComponent';
import InfoDisplayComponent from '../components/InfoDisplayComponent';


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

    // Define the delay function
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      
      useEffect(() => {
        const storedIframeUrl = sessionStorage.getItem('MyListingUrl') || '';
        if (!storedIframeUrl) {
            console.error('MyListingUrl is not set in session storage.');
        } else {
            console.log(storedIframeUrl);
            setIframeUrl(storedIframeUrl);
        }
    }, []);

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

            console.log('Calling Vendasta Automation API');
            const vendastaAutomationResponse = await fetch('/api/vendasta-automation-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, website, company: companyName })
            });
            const vendastaAutomationData = await vendastaAutomationResponse.json();
            console.log('Vendasta Automation API Response:', vendastaAutomationData);
            const accountID = vendastaAutomationData.accountID;
            console.log('Account ID is:', accountID);

            // Grab MyListingUrl from Session Storage in useEffect
            useEffect(() => {
                const storedIframeUrl = sessionStorage.getItem('MyListingUrl') || '';
                if (!storedIframeUrl) {
                    console.error('MyListingUrl is not set in session storage.');
                } else {
                    console.log(storedIframeUrl);
                    setIframeUrl(storedIframeUrl);
                }
            }, []);

            // Set iframe URL
            // setIframeUrl(iframeUrl);
            setShowIframe(true);
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
                        {zapierResponse && (
                            <div className="response" dangerouslySetInnerHTML={{ __html: formatResponse(zapierResponse) }}></div>
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
                <InfoDisplayComponent
                    screenshotUrl={screenshotUrl}
                    showIframe={showIframe}
                    iframeUrl={iframeUrl}
                />
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
                }
            `}</style>
        </div>
    );
};

export default MainContainer;
