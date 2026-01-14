import React from 'react';

interface IconProps {
    className?: string;
}

export const FastDeliveryIcon: React.FC<IconProps> = ({ className = "w-10 h-10" }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M19 19.8V16.2C19 14.985 18.015 14 16.8 14H16.2C15.5373 14 15 13.4627 15 12.8V5.2C15 3.43269 13.5673 2 11.8 2H6.2C4.43269 2 3 3.43269 3 5.2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 22H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="6" y="5" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
        <path d="M15 8L18 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 5L20.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 13H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 10H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 16H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const QualityIcon: React.FC<IconProps> = ({ className = "w-10 h-10" }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const Available247Icon: React.FC<IconProps> = ({ className = "w-10 h-10" }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const TrackingIcon: React.FC<IconProps> = ({ className = "w-10 h-10" }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
);
