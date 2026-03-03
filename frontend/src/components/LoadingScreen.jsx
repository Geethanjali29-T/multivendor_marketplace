import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

const LoadingScreen = () => {
    const [loadingText, setLoadingText] = useState('CONNECTING TO ECOSYSTEM');

    // Fun little effect to change the loading text progressively
    useEffect(() => {
        const texts = [
            'CONNECTING TO ECOSYSTEM',
            'VERIFYING LOCAL VENDORS',
            'PREPARING YOUR DASHBOARD'
        ];

        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % texts.length;
            setLoadingText(texts[i]);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading-container">
            <div className="loading-logo-box">
                <Zap size={40} color="white" fill="white" />
            </div>

            <div className="typewriter-wrapper">
                <div className="typewriter-text">
                    TradeLink....
                </div>
            </div>

            <div className="loading-status">
                {loadingText}...
            </div>
        </div>
    );
};

export default LoadingScreen;
