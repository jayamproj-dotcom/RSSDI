
import React, { useState, useEffect } from 'react';

export const Notification = ({ message, type, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            startExit();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const startExit = () => {
        setIsExiting(true);
        setTimeout(onClose, 400); // Match animation duration
    };

    return (
        <div className={`notification ${type} ${isExiting ? 'exiting' : ''}`}>
            <div className="notification-content">
                {type === 'success' ? (
                    <svg className="notification-icon" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
                    </svg>
                ) : (
                    <svg className="notification-icon" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M13 13H11V7H13M13 17H11V15H13M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z" />
                    </svg>
                )}
                <span>{message}</span>
            </div>
            <button
                className="notification-close"
                onClick={startExit}
                aria-label="Close notification"
            >
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
            </button>
        </div>
    );
};