import React from 'react';

interface IconProps {
    className?: string;
}

export const HPIcon: React.FC<IconProps> = ({ className = "w-16 h-16" }) => (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#0072CE" stroke="white" strokeWidth="4" />
        <text x="50" y="65" fontSize="40" fontWeight="bold" fill="white" textAnchor="middle">HP</text>
    </svg>
);

export const BPIcon: React.FC<IconProps> = ({ className = "w-16 h-16" }) => (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="#FFD700" strokeWidth="4" fill="none" />
        <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" fill="#FFD700" />
        <text x="50" y="65" fontSize="20" fontWeight="bold" fill="#0072CE" textAnchor="middle" style={{ display: 'none' }}>BP</text>
    </svg>
);

export const ShellIcon: React.FC<IconProps> = ({ className = "w-16 h-16" }) => (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M15 35 Q50 10 85 35 L75 85 H25 L15 35 Z" fill="#FBCE07" stroke="#DA291C" strokeWidth="4" />
        <path d="M50 15 L50 85 M15 35 L50 85 M85 35 L50 85" stroke="#DA291C" strokeWidth="4" strokeLinecap="round" />
    </svg>
);

export const NayaraIcon: React.FC<IconProps> = ({ className = "w-16 h-16" }) => (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#F37021" />
        <path d="M30 30 L50 70 L70 30" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
