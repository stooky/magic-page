"use client";

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { callZapierWebhook } from '../components/utils/zapier';
import screensConfig from '../config/screensConfig';
import FormComponent from '../components/FormComponent';
import PollComponent from '../components/PollComponent';
import useTheme from '../components/utils/theme';

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
    const theme = useTheme();

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
        if (countdown > 0) {
            countdownInterval = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setShowIframe(true);
            clearInterval(countdownInterval);
        }
        return () => clearInterval(countdownInterval);
    }, [countdown]);

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
        return `Magic Page Company = ${cleanedWebsite}`;
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

        if (!callbackReceived) {
            alert("Please wait until the current request is processed.");
            return;
        }

        await fetch('/api/clear-response', { method: 'POST' });

        const uniqueId = uuidv4();

        sessionStorage.setItem('requestId', uniqueId);

        setLoading(true);
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

            const companyName = response && response.message ? extractCompanyName(response.message, website) : `Magic Page Company = ${website.replace(/^https?:\/\//, '')}`;
            console.log("Extracted Company Name: " + companyName);

            console.log('Calling Vendasta Webhook');
            const vendastaResponse = await fetch('/api/vendasta-proxy', {
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
        <div className={`container ${theme}`}>
            <h1>Magic Page</h1>
            <div className="timer">Time Elapsed: {elapsedTime} seconds</div>
            <FormComponent onSubmit={handleSubmit} />
            {showPoll && (
                <PollComponent
                    currentScreen={currentScreen}
                    currentScreenIndex={currentScreenIndex}
                    responses={responses}
                    handleOptionChange={handleOptionChange}
                />
            )}
            <div className="content">
                {screenshotUrl && (
                    <div className="thumbnail">
                        <h2>Website Thumbnail</h2>
                        <img src={screenshotUrl} alt="Website Thumbnail" />
                    </div>
                )}
                {zapierResponse && zapierResponse.status === 'error' ? (
                    <div className="response error" dangerouslySetInnerHTML={{ __html: formatErrorResponse(zapierResponse) }}></div>
                ) : zapierResponse && (
                    <div className="response" dangerouslySetInnerHTML={{ __html: formatResponse(zapierResponse) }}></div>
                )}
                {countdown > 0 && (
                    <div className="countdown">Loading iframe in {countdown} seconds...</div>
                )}
                {showIframe && (
                    <div className="iframe-container">
                        <iframe src={iframeUrl} width="100%" height="600px" title="Vendasta Iframe"></iframe>
                    </div>
                )}
            </div>
            <style jsx>{`
                .container {
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    color: ${theme === 'dark' ? '#fff' : '#000'};
                    background-color: ${theme === 'dark' ? '#333' : '#fff'};
                    text-align: center;
                    min-height: 100vh;
                }
                .timer {
                    font-size: 1.5em;
                    margin-bottom: 20px;
                    color: ${theme === 'dark' ? '#fff' : '#000'};
                }
                form {
                    display: flex;
                    flex-direction: column;
                }
                label {
                    color: ${theme === 'dark' ? '#fff' : '#000'};
                    margin-bottom: 5px;
                }
                input {
                    display: block;
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 10px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                    box-sizing: border-box;
                    color: #000;
                    background-color: #fff;
                }
                button {
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
                .content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: 20px;
                }
                .thumbnail {
                    margin-bottom: 20px;
                    text-align: center;
                }
                .thumbnail img {
                    width: 100%;
                    max-width: 400px; /* Adjust size here to make it twice as big */
                    border-radius: 10px;
                }
                .response {
                    white-space: pre-line;
                    font-size: 1.2em;
                    margin-top: 20px;
                    color: ${theme === 'dark' ? '#fff' : '#000'};
                }
                .response.error {
                    color: red;
                }
                .countdown {
                    font-size: 1.5em;
                    margin-top: 20px;
                    color: ${theme === 'dark' ? '#fff' : '#000'};
                }
                .iframe-container {
                    margin-top: 20px;
                }
            `}</style>
        </div>
    );
};

export default MainContainer;
