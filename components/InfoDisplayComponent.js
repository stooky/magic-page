import React from 'react';
import StaticMarketingComponent from './StaticMarketingComponent'; 
import Image from 'next/image';

const InfoDisplayComponent = ({ screenshotUrl, zapierResponse, countdown, showIframe, iframeUrl }) => {
    const formatErrorResponse = (response) => {
        if (response && response.rawBody) {
            return `<strong>Error:</strong> ${response.message}<br/><br/><strong>Raw Body:</strong><br/>${response.rawBody.replace(/\n/g, '<br />')}`;
        }
        return `<strong>Error:</strong> ${response.message}`;
    };

    const formatResponse = (response) => {
        if (response && response.message) {
            return response.message.replace(/\n/g, '<br />');
        }
        return '';
    };

    return (
        <div>
            {screenshotUrl && (
                <div className="thumbnail">
                    <h2>Website Thumbnail</h2>
                    <Image src={screenshotUrl} alt="Website Thumbnail" className="small-thumbnail" width={200} height={200} />
                </div>
            )}
            {zapierResponse && zapierResponse.status === 'error' ? (
                <div className="response error" dangerouslySetInnerHTML={{ __html: formatErrorResponse(zapierResponse) }}></div>
            ) : zapierResponse && (
                <div className="response" dangerouslySetInnerHTML={{ __html: formatResponse(zapierResponse) }}></div>
            )}
            {countdown > 0 && !showIframe && (
                <div className="countdown">Loading iframe in {countdown} seconds...</div>
            )}
            {showIframe && (
                <div className="iframe-container">
                    <iframe src={iframeUrl} width="100%" height="600px" title="Vendasta Iframe"></iframe>
                </div>
            )}
            {!screenshotUrl && !zapierResponse && !showIframe && (
                <StaticMarketingComponent />
            )}
            <style jsx>{`
                .thumbnail img {
                    width: 100%;
                    max-width: 400px; /* Original size */
                    border-radius: 10px;
                }
                .thumbnail img.small-thumbnail {
                    max-width: 200px; /* Smaller size */
                }
            `}</style>
        </div>
    );
};

export default InfoDisplayComponent;
