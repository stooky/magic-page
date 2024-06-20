import React, { useState } from 'react';

const FormComponent = ({ onSubmit }) => {
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(email, website);
    };

    return (
        <form onSubmit={handleSubmit} className="form">
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
            <button type="submit">Build AI Agent</button>
            <style jsx>{`
                .form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 20px;
                }
                label {
                    margin-bottom: 10px;
                    font-size: 1.2em;
                    color: #333;
                }
                input {
                    width: 100%;
                    max-width: 400px;
                    padding: 10px;
                    margin-bottom: 15px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                    box-sizing: border-box;
                    font-size: 1em;
                }
                button {
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1em;
                }
                button:hover {
                    background-color: #0056b3;
                }
            `}</style>
        </form>
    );
};

export default FormComponent;
