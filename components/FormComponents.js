import React, { useState } from 'react';

const FormComponent = ({ onSubmit }) => {
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(email, website);
    };

    return (
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
            <button type="submit">Build AI Agent</button>
        </form>
    );
};

export default FormComponent;
