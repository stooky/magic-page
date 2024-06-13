import React, { useState } from 'react';
import { callZapierWebhook } from '../components/utils/zapier';

const ZapierPage = () => {
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await callZapierWebhook(email, website);
            setResponse(result);
        } catch (err) {
            setError('Error calling Zapier webhook');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Zapier Webhook Test</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ margin: '10px 0', padding: '10px', width: '100%' }}
                    />
                </label>
                <label>
                    Website:
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        required
                        style={{ margin: '10px 0', padding: '10px', width: '100%' }}
                    />
                </label>
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Submit</button>
            </form>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {response && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Response:</h2>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default ZapierPage;
