"use client";

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { callZapierWebhook } from '../components/utils/zapier';
import screensConfig from '../config/screensConfig';
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
    const [elapsedTime, setElapsedTime] = useState(0);
    const [countdown, setCountdown] = useState(10);
    const [showIframe, setShowIframe] = useState(false);
    const [formVisible, setFormVisible] = useState(true);
    const [enteredWebsite, setEnteredWebsite] = useState('');

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setElapsedTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [loading]);

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
        let countdownInterval;
        if (countdown > 0 && !showIframe) {
            countdownInterval = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setShowIframe(true);
            clearInterval(countdownInterval);
        }
        return () => clearInterval(countdownInterval);
    }, [countdown, showIframe]);

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

    const createIframeUrl = (companyName) => {
        const formattedName = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const url = `https://sales.vendasta.com/${formattedName}/`;
        console.log("Constructed Iframe URL:", url);
        return url;
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

        const uniqueId = uuidv4();

        sessionStorage.setItem('requestId', uniqueId);

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

            const response = await callZapierWebhook(email, website, uniqueId);
            console.log('Zapier Response:', response);  // Log the full response
            setZapierResponse(response);

            const companyName = response && response.message ? extractCompanyName(response.message, website) : `magic-page-company-${website.replace(/^https?:\/\//, '').replace(/\./g, '-')}`;
            console.log("Extracted Company Name: " + companyName);

            console.log('Calling Vendasta Webhook');
            const vendastaResponse = await fetch('/api/vendasta-automation-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, website, company: companyName })
            });
            const vendastaData = await vendastaResponse.json();
            console.log('Vendasta Webhook Response:', vendastaData);

            // Set iframe URL
            const iframeUrl = createIframeUrl(companyName);
            setIframeUrl(iframeUrl);

            // Start countdown
            setCountdown(10);
            setShowIframe(false);
        } catch (error) {
            console.error('Failed to call webhooks:', error);
            setZapierResponse({ status: 'error', message: `Failed to call webhooks: ${error.message}` });
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
                <h1>Generate leads while you sleep</h1>
                <div className="description">
                    Turn your website visitors into leads with a custom AI Agent built with ChatGPT
                </div>
                {formVisible ? (
                    <FormComponent onSubmit={handleSubmit} />
                ) : (
                    <div className="building-message">
                        Building AI Employee for {enteredWebsite}
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
                    zapierResponse={zapierResponse}
                    countdown={countdown}
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
