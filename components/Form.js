"use client";

import React, { useState, useEffect } from 'react';
import { callZapierWebhook } from '../components/utils/zapier';
import { v4 as uuidv4 } from 'uuid';

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
    const [theme, setTheme] = useState('light');
    const [zapierResponse, setZapierResponse] = useState(null);
    const [phraseIndex, setPhraseIndex] = useState(0);

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
            pollingInterval = setInterval(async () => {
                try {
                    const response = await fetch('/api/get-latest-response');
                    const data = await response.json();
                    if (data.response && data.response.status) {
                        setZapierResponse(data.response);
                        setLoading(false); // Stop loading once response is received
                        clearInterval(pollingInterval); // Clear the interval once we have the response
                    }
                } catch (error) {
                    console.error('Error polling latest response:', error);
                }
            }, 2000); // Poll every 2 seconds
        }
        return () => clearInterval(pollingInterval);
    }, [loading]);

    useEffect(() => {
        let phraseInterval;
        if (showJoke) {
            phraseInterval = setInterval(() => {
                setPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
            }, 5000); // Change phrase every 5 seconds
        }
        return () => clearInterval(phraseInterval);
    }, [showJoke]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !website || !email.includes('@') || !website.startsWith('http')) {
            alert("Please enter a valid email and website URL.");
            return;
        }

        // Generate a unique identifier for the request
        const uniqueId = uuidv4(); // or use another method to generate a unique ID

        // Log the generated unique identifier
        console.log('Generated Unique ID:', uniqueId);

        // Store the unique identifier in session storage
        sessionStorage.setItem('requestId', uniqueId);

        // Log storing the unique identifier in session storage
        console.log('Stored Unique ID in Session Storage:', sessionStorage.getItem('requestId'));

        setShowJoke(true);
        setLoading(true);

        try {
            // Log the unique identifier when calling the Zapier webhook
            console.log('Calling Zapier Webhook with Unique ID:', uniqueId);

            const response = await callZapierWebhook(email, website, uniqueId);
            setZapierResponse(response);

            // Log the response received from the Zapier webhook
            console.log('Received response from Zapier Webhook:', response);
        } catch (error) {
            // Log the error if the Zapier webhook call fails
            console.error('Failed to call Zapier Webhook:', error);
            setZapierResponse({ message: `Failed to call Zapier webhook: ${error.message}` });
        }
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
                <button type="submit" style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
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
            {zapierResponse && (
                <div style={{ marginTop: '20px', color: theme === 'dark' ? '#fff' : '#333' }} dangerouslySetInnerHTML={{ __html: formatResponse(zapierResponse) }}>
                </div>
            )}
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
