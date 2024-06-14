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
            pollingInterval = setInterval(async () => {
                try {
                    const response = await fetch('/api/get-latest-response');
                    const data = await response.json();
                    if (data.response && data.response.status) {
                        setZapierResponse(data.response);
                        setLoading(false); // Stop loading once response is received
                        clearInterval(pollingInterval); // Clear the interval once we have the response
                        clearInterval(phraseInterval); // Clear the phrase interval once we have the response
                        setShowJoke(false); // Stop showing phrases
                    }
                } catch (error) {
                    console.error('Error polling latest response:', error);
                }
            }, 2000); // Poll every 2 seconds
        }
        return () => clearInterval(pollingInterval);
    }, [loading, phraseInterval]);

    useEffect(() => {
        let intervalId;
        if (showJoke) {
            intervalId = setInterval(() => {
                setPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
            }, 5000); // Change phrase every 5 seconds
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
        clearInterval(phraseInterval);
        setPhraseIndex(0);
        setShowJoke(false);

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
        return '';
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
                        width: '100
