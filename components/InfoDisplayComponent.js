import React from 'react';
import StaticMarketingComponent from './StaticMarketingComponent'; // Adjust the path as necessary


const InfoDisplayComponent = ({ stage, screenshotUrl, zapierResponse, countdown, showIframe, iframeUrl }) => (
    <div className="content">
        {stage === 1 && (
            <div className="static-marketing">
                <StaticMarketingComponent />
            </div>
        )}
        {stage === 2 && screenshotUrl && (
            <div className="thumbnail">
                <h2>Website Thumbnail</h2>
                <img src={screenshotUrl} alt="Website Thumbnail" />
            </div>
        )}
        {stage === 3 && (
            <>
                {zapierResponse && zapierResponse.status === 'error' ? (
                    <div className="response error" dangerouslySetInnerHTML={{ __html: zapierResponse.message }}></div>
                ) : zapierResponse && (
                    <div className="response" dangerouslySetInnerHTML={{ __html: zapierResponse.message }}></div>
                )}
                {countdown > 0 && !showIframe && (
                    <div className="countdown">Loading iframe in {countdown} seconds...</div>
                )}
                {showIframe && (
                    <div className="iframe-container">
                        <iframe src={iframeUrl} width="100%" height="600px" title="Vendasta Iframe"></iframe>
                    </div>
                )}
            </>
        )}
        <style jsx>{`
            .content {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 20px;
            }
            .thumbnail {
                margin-bottom: 20px;
                text-align: center;
            }
            .thumbnail img {
                width: 100%;
                max-width: 400px;
                border-radius: 10px;
            }
            .response {
                white-space: pre-line;
                font-size: 1.2em;
                margin-top: 20px;
                color: #000;
            }
            .response.error {
                color: red;
            }
            .countdown {
                font-size: 1.5em;
                margin-top: 20px;
                color: #000;
            }
            .iframe-container {
                margin-top: 20px;
            }
        `}</style>
    </div>
);

export default InfoDisplayComponent;
