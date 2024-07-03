import React from 'react';
import Image from 'next/image';

const StaticMarketingComponent = () => (
    <div className="marketing-container">
        <Image src="/images/marketing_image_1.png" alt="Marketing Image" width={200} height={200} />
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
