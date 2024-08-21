import React from 'react';
import '../src/css/main.css';
import '../src/css/style.css';

export default function ScanningComponent({ screenshotUrl }) {
    return (
        <div className="magic_mock_body">
            <div className="mock_box">
                <h2 className="thumb_text"> Hang on while we scan <br/> your website... </h2>
                <br/><br/>

                <div className="thumbnail_sec">
                    <div className="web_thumb_img">
                        <img src={screenshotUrl} alt="Website Thumbnail" />
                    </div>
                </div>    
            </div>

            <div className="footer">
                <p className="foot_logo"> 
                    <i> Powered by </i>
                    <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 653.1 98.47">
                        {/* SVG Content */}
                    </svg>
                </p>
                <p> Copyright © 2024  &nbsp; | &nbsp;  Privacy Policy &nbsp;  |  &nbsp; Legal </p>
            </div>
        </div>
    );
}
