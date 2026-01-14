import React from 'react';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-orange-500 ${className}`}
        >
            <path d="M3 22v-8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8" fill="currentColor" fillOpacity="0.1" />
            <path d="M3 22h12" />
            <path d="M4 12V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8" />
            <path d="M14 13a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2z" />
            <path d="M16 11V7a4 4 0 0 0-8 0" />
            <path d="M16 17v3a2 2 0 0 1-2 2h-1" />
            <rect x="6" y="5" width="4" height="4" rx="1" fill="currentColor" />
        </svg>
    );
};

export const LogoIcon: React.FC<LogoProps> = ({ className = "w-6 h-6" }) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`text-orange-500 ${className}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M19 19.8V16.2C19 14.985 18.015 14 16.8 14H16.2C15.5373 14 15 13.4627 15 12.8V5.2C15 3.43269 13.5673 2 11.8 2H6.2C4.43269 2 3 3.43269 3 5.2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 22H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect x="6" y="5" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
            <path d="M15 8L18 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 5L20.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 22V20C21 17 18 17 18 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
