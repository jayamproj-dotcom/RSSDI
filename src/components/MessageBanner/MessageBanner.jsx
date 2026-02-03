
import React, { useState } from 'react';
import './MessageBanner.css'
const MessageBanner = ({ message }) => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="message-to-doctor">
            <span className="message-text">{message}</span>
            <button className="close-button" onClick={() => setVisible(false)}>×</button>
        </div>
    );
};

export default MessageBanner;
