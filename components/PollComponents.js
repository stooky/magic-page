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
        </div>
    );
};

export default PollComponent;
