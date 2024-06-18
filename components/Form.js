"use client";

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { callZapierWebhook } from '../components/utils/zapier';
import screensConfig from '../config/screensConfig'; // Import screens configuration

const Form = () => {
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [loading, setLoading] = useState(false);
    const [callbackReceived, setCallbackReceived] = useState(true);
    const [theme, setTheme] = useState('light');
    const [zapierResponse, setZapierResponse] = useState(null);
    const [screenshotUrl, setScreenshotUrl] = useState(null);
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const [responses, setResponses] = useState({});
    const [showPoll, setShowPoll] = useState(false);

    useEffect(() => {
        const detectTheme = () => {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
            } else {
                setTheme('light');
            }
        };

        detectTheme();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectTheme);

        return () => {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', detectTheme);
        };
    }, []);

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
    };

    const handleNext = () => {
        if (currentScreenIndex < screensConfig.length - 1) {
            setCurrentScreenIndex(currentScreenIndex + 1);
        } else {
            setShowPoll(false);
        }
    };

    const handlePrevious = () => {
        if (currentScreenIndex > 0) {
            setCurrentScreenIndex(currentScreenIndex - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        setShowPoll(true); // Show the poll questions

        try {
            const screenshotResponse = await fetch(`/api/get-screenshot?url=${encodeURIComponent(website)}`);
            const screenshotData = await screenshotResponse.json();
            if (screenshotData.screenshotUrl) {
                setScreenshotUrl(screenshotData.screenshotUrl);
            } else {
                console.error('Error fetching screenshot:', screenshotData.error);
            }

            const response = await callZapierWebhook(email, website, uniqueId);
            setZapierResponse(response);
        } catch (error) {
            setZapierResponse({ status: 'error', message: `Failed to call Zapier webhook: ${error.message}` });
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
            <h1>Magic Page</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label htmlFor="website">Website URL:</label>
                <input
                    type="url"
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    required
                />
                <button type="submit" disabled={!callbackReceived}>
                    Build AI Agent
                </button>
            </form>
            {showPoll && (
                <div className="poll-container">
                    <h2>{currentScreen.title}</h2>
                    <div className="poll-content">
                        <img src={currentScreen.imageUrl} alt={currentScreen.title} className="poll-image" />
                        <div className="poll-options">
                            {currentScreen.options.map((option, index) => (
                                <label key={index}>
                                    <input
                                        type="radio"
                                        value={option}
                                        checked={responses[currentScreenIndex] === option}
                                        onChange={() => handleOptionChange(option)}
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="navigation-buttons">
                        <button type="button" onClick={handlePrevious} disabled={currentScreenIndex === 0}>
                            Previous
                        </button>
                        <button type="button" onClick={handleNext}>
                            Next
                        </button>
                    </div>
                </div>
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
                    color: #fff;
                }
                form {
                    display: flex;
                    flex-direction: column;
                }
                label {
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
                .poll-container {
                    margin-top: 20px;
                }
                .poll-container h2 {
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .poll-content {
                    display: flex;
                    align-items: center;
                }
                .poll-image {
                    width: 150px;
                    height: 150px;
                    border-radius: 10px;
                    margin-right: 20px;
                }
                .poll-options {
                    display: flex;
                    flex-direction: column;
                }
                .poll-options label {
                    display: block;
                    margin-bottom: 10px;
                }
                .navigation-buttons {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                }
                .content {
                    display: flex;
                    margin-top: 20px;
                    flex-direction: column;
                }
                .thumbnail {
                    margin-bottom: 20px;
                }
                .thumbnail img {
                    width: 100%;
                    border-radius: 10px;
                }
                .response {
                    white-space: pre-line;
                }
                .response.error {
                    color: red;
                }
                @media (min-width: 600px) {
                    .content {
                        flex-direction: row;
                    }
                    .thumbnail {
                        flex: 1;
                        margin-right: 20px;
                    }
                    .response {
                        flex: 2;
                    }
                }
            `}</style>
        </div>
    );
};

export default Form;
