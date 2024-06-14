"use client";

import React, { useState, useEffect } from 'react';

const phrases = [
    "We are learning about you.",
    "Oh, this is very interesting.",
    "Almost there ..."
];

const Form = () => {
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [showJoke, setShowJoke] = useState(false);
    const [loading, setLoading] = useState(false);
    const [callbackReceived, setCallbackReceived] = useState(true);
    const [theme, setTheme] = useState('light');
    const [zapierResponse, setZapierResponse] = useState(null);
    const [screenshotUrl, setScreenshotUrl] = useState(null);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [phraseInterval, setPhraseInterval] = useState(null);

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
                        clearInterval(phraseInterval);
                        setShowJoke(false);
                    }
                } catch (error) {
                    console.error('Error polling latest response:', error);
                }
            }, 2000);
        }
        return () => clearInterval(pollingInterval);
    }, [loading, phraseInterval]);

    useEffect(() => {
        let intervalId;
        if (showJoke) {
            intervalId = setInterval(() => {
                setPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
            }, 5000);
            setPhraseInterval(intervalId);
        }
        return () => clearInterval(intervalId);
    }, [showJoke]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !website || !email.includes('@') || !website.startsWith('http')) {
            alert("Please enter a valid email and website URL.");
            return;
        }

        // Clear previous response and intervals
        setZapierResponse(null);
        setScreenshotUrl(null);
        clearInterval(phraseInterval);
        setPhraseIndex(0);
        setShowJoke(false);

        // Check if the previous request has received a callback
        if (!callbackReceived) {
            alert("Please wait until the current request is processed.");
            return;
        }

        // Clear any previous responses from the backend
        await fetch('/api/clear-response', { method: 'POST' });

        // Generate a unique identifier for the request
        const uniqueId = uuidv4();

        // Log the generated unique identifier
        console.log('Generated Unique ID:', uniqueId);

        // Store the unique identifier in session storage
        sessionStorage.setItem('requestId', uniqueId);

        // Log storing the unique identifier in session storage
        console.log('Stored Unique ID in Session Storage:', sessionStorage.getItem('requestId'));

        setShowJoke(true);
        setLoading(true);

        try {
            // Fetch the screenshot of the website
            const screenshotResponse = await fetch(`/api/get-screenshot?url=${encodeURIComponent(website)}`);
            const screenshotData = await screenshotResponse.json();
            if (screenshotData.screenshotUrl) {
                setScreenshotUrl(screenshotData.screenshotUrl);
            }

            // Log the unique identifier when calling the Zapier webhook
            console.log('Calling Zapier Webhook with Unique ID:', uniqueId);

            const response = await callZapierWebhook(email, website, uniqueId);
            setZapierResponse(response);

            // Log the response received from the Zapier webhook
            console.log('Received response from Zapier Webhook:', response);
        } catch (error) {
            // Log the error if the Zapier webhook call fails
            console.error('Failed to call Zapier Webhook:', error);
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

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#fff' }}>
            <h1>Welcome to Magic Page</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        marginBottom: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                        color: '#000',
                        backgroundColor: '#fff'
                    }}
                />
                <label htmlFor="website" style={{ display: 'block', marginBottom: '5px' }}>Website URL:</label>
                <input
                    type="url"
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    required
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        marginBottom: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                        color: '#000',
                        backgroundColor: '#fff'
                    }}
                />
                <button 
                    type="submit" 
                    style={{
                        padding: '10px 20px',
                        backgroundColor: callbackReceived ? '#007bff' : '#ccc',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: callbackReceived ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!callbackReceived}
                >
                    Build AI Agent
                </button>
            </form>
            {showJoke && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <div style={{
                        fontSize: '24px',
                        color: '#007bff',
                        animation: 'fade-in-out 5s infinite'
                    }}>
                        {phrases[phraseIndex]}
                    </div>
                </div>
            )}
            <div style={{ display: 'flex', marginTop: '20px' }}>
                {screenshotUrl && (
                    <div style={{ flex: '1', marginRight: '20px' }}>
                        <h2>Website Thumbnail</h2>
                        <img src={screenshotUrl} alt="Website Thumbnail" style={{ width: '100%', borderRadius: '10px' }} />
                    </div>
                )}
                {zapierResponse && zapierResponse.status === 'error' ? (
                    <div style={{ 
                        flex: '2',
                        color: theme === 'dark' ? '#fff' : '#333',
                        whiteSpace: 'pre-line' // Ensure line breaks are respected
                    }} dangerouslySetInnerHTML={{ __html: formatErrorResponse(zapierResponse) }}>
                    </div>
                ) : zapierResponse && (
                    <div style={{ 
                        flex: '2',
                        color: theme === 'dark' ? '#fff' : '#333',
                        whiteSpace: 'pre-line' // Ensure line breaks are respected
                    }} dangerouslySetInnerHTML={{ __html: formatResponse(zapierResponse) }}>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes fade-in-out {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default Form;
