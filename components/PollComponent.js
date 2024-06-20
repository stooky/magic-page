import React from 'react';

const PollComponent = ({ currentScreen, currentScreenIndex, responses, handleOptionChange }) => {
    return (
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
            <style jsx>{`
                .poll-container {
                    margin-top: 20px;
                    text-align: center;
                }
                .poll-content {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                }
                .poll-image {
                    width: 150px;
                    height: 150px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }
                .poll-options {
                    display: flex;
                    flex-direction: column;
                }
                .poll-options label {
                    margin-bottom: 10px;
                    font-size: 1.2em;
                    color: #333;
                }
            `}</style>
        </div>
    );
};

export default PollComponent;
