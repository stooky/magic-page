"use client";

import React, { useState, useEffect } from 'react';
import { callZapierWebhook } from '../components/utils/zapier';

const jokes = [
    // Your jokes array
];

const Form = () => {
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [jokeIndex, setJokeIndex] = useState(0);
    const [showJoke, setShowJoke] = useState(false);
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState('light');
    const [zapierResponse, setZapierResponse] = useState(null);

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
                        data.response="";
                    }
                } catch (error) {
                    console.error('Error polling latest response:', error);
                }
            }, 2000); // Poll every 2 seconds
        }
        return () => clearInterval(pollingInterval);
    }, [loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !website || !email.includes('@') || !website.startsWith('http')) {
            alert("Please enter a valid email and website URL.");
            return;
        }
        setShowJoke(true);
        setLoading(true);
        cycleJokes();

        try {
            const response = await callZapierWebhook(email, website);
            setZapierResponse(response);
        } catch (error) {
            setZapierResponse({ message: `Failed to call Zapier webhook: ${error.message}` });
        }
    };

    const cycleJokes = () => {
        let index = 0;
        const intervalId = setInterval(() => {
            setJokeIndex(index);
            index = (index + 1) % jokes.length;
            if (index === 0) {
                clearInterval(intervalId);
                setLoading(false);
            }
        }, 4000);
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
                        fontSize: '18px',
                        color: theme === 'dark' ? '#fff' : '#333',
                        animation: 'fade-in-out 4s infinite'
                    }}>
                        {jokes[jokeIndex]}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                        <div className="spinner" style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #ccc',
                            borderTop: '4px solid #007bff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                    </div>
                </div>
            )}
            {zapierResponse && (
                <div style={{ marginTop: '20px', color: theme === 'dark' ? '#fff' : '#333' }}>
                    {zapierResponse.message}
                </div>
            )}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
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
