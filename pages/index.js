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
    const theme = useTheme();

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
            `}</style>
        </div>
    );
};

export default MainContainer;
