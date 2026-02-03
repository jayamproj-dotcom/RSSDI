// components/Tooltip.js
import React, { useState } from 'react';
import './Tooltip.css';

const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="tooltip-container">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && <div className="tooltip">{text}</div>}
        </div>
    );
};

export default Tooltip;