import React from 'react';

const StaticMarketingComponent = () => (
    <div className="marketing-container">
        <img src="/path/to/your/marketing-image.png" alt="Marketing" />
        <style jsx>{`
            .marketing-container {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
            }
            img {
                max-width: 100%;
                max-height: 100%;
            }
        `}</style>
    </div>
);

export default StaticMarketingComponent;
