import React from 'react';

const PromptComponent = ({ onSubmit }) => {
    const [prompt, setPrompt] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(prompt);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="prompt">Enter Prompt:</label>
            <input
                type="text"
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <button type="submit">Submit</button>
            <style jsx>{`
                form {
                    display: flex;
                    flex-direction: column;
                }
                label {
                    margin-bottom: 5px;
                }
                input {
                    padding: 10px;
                    margin-bottom: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            `}</style>
        </form>
    );
};

export default PromptComponent;
