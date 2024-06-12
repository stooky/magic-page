// components/Form.js
"use client";

import React, { useState, useEffect } from 'react';

const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    "Parallel lines have so much in common. It’s a shame they’ll never meet.",
    "My wife accused me of being immature. I told her to get out of my fort.",
    "Why don't skeletons fight each other? They don't have the guts.",
    "What do you call cheese that isn't yours? Nacho cheese.",
    "Why couldn't the bicycle stand up by itself? It was two tired.",
    "I'm reading a book on anti-gravity. It's impossible to put down!",
    "Want to hear a joke about construction? I’m still working on it.",
    "What do you get when you cross a snowman with a vampire? Frostbite."
];

const Form = () => {
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [jokeIndex, setJokeIndex] = useState(0);
    const [showJoke, setShowJoke] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !website || !email.includes('@') || !website.startsWith('http')) {
            alert("Please enter a valid email and website URL.");
            return;
        }
        setShowJoke(true);
        setLoading(true);
        cycleJokes();
    };

    const cycleJokes = () => {
        let index = 0;
        const intervalId = setInterval(() => {
            setJokeIndex(index);
            if (index === 2) {
                clearInterval(intervalId);
                setLoading(false);
            }
            index = (index + 1) % 3; // Cycle through 3 jokes
        }, 3000);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
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
                        boxSizing: 'border-box'
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
                        boxSizing: 'border-box'
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
                    {loading ? (
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
                    ) : (
                        <p style={{ fontSize: '18px', color: '#333' }}>{jokes[jokeIndex]}</p>
                    )}
                </div>
            )}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Form;
