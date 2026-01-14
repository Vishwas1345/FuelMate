import React from 'react';

// Premium Texture Definitions
const TextureDefs = () => (
    <defs>
        {/* Subtle grid pattern */}
        <pattern id="grid-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
        </pattern>

        {/* Dark Premium Gradient Background */}
        <linearGradient id="card-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Accents */}
        <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="grad-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id="grad-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
    </defs>
);

// Shared Card Container to ensure consistent Look
const CardContainer = ({ children }: { children: React.ReactNode }) => (
    <>
        <TextureDefs />
        <rect x="0" y="0" width="100%" height="100%" rx="16" fill="url(#card-bg)" />
        {children}
    </>
);

// Hero Image: Fuel Drop with Spark (Larger, more detailed)
export const HeroFeatureImage = ({ className = "w-32 h-32" }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <TextureDefs />
        {/* Glow effect backing */}
        <circle cx="100" cy="100" r="80" fill="#f97316" opacity="0.1" filter="url(#glow-orange)" />

        {/* Drop Shape */}
        <path d="M100 40 Q140 100 140 135 A40 40 0 0 1 60 135 Q60 100 100 40 Z" fill="url(#grad-orange)" stroke="#fff" strokeWidth="1" strokeOpacity="0.5" />

        {/* Spark */}
        <path d="M125 45 L135 25 L145 45 M115 35 L105 15 L145 15" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />

        {/* Shine */}
        <path d="M85 110 Q85 80 100 60" stroke="white" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
    </svg>
);

// Feature: Fast Delivery V2 (Rocket/Speed)
export const FastDeliveryImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <CardContainer>
            {/* Speed Lines Background */}
            <g opacity="0.3">
                <line x1="10" y1="20" x2="40" y2="20" stroke="url(#grad-orange)" strokeWidth="1" strokeDasharray="5 5">
                    <animate attributeName="x1" from="10" to="90" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="x2" from="40" to="120" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
                </line>
                <line x1="0" y1="80" x2="30" y2="80" stroke="url(#grad-orange)" strokeWidth="1" strokeDasharray="5 5">
                    <animate attributeName="x1" from="0" to="80" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="x2" from="30" to="110" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
                </line>
            </g>

            {/* Rocket / Truck abstract */}
            <g transform="translate(50, 50) rotate(45)">
                {/* Main Body */}
                <path d="M0 -30 Q15 -10 15 20 L0 35 L-15 20 Q-15 -10 0 -30 Z" fill="url(#grad-orange)" filter="url(#glow-orange)">
                    <animateTransform attributeName="transform" type="translate" values="0,0; 2,-2; 0,0" dur="0.2s" repeatCount="indefinite" />
                </path>
                {/* Wings */}
                <path d="M15 20 L25 30 L15 30 Z" fill="#c2410c" />
                <path d="M-15 20 L-25 30 L-15 30 Z" fill="#c2410c" />

                {/* Flame */}
                <path d="M0 35 Q5 45 0 55 Q-5 45 0 35 Z" fill="#fbbf24">
                    <animate attributeName="d" values="M0 35 Q5 45 0 55 Q-5 45 0 35 Z; M0 35 Q8 50 0 65 Q-8 50 0 35 Z; M0 35 Q5 45 0 55 Q-5 45 0 35 Z" dur="0.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="0.2s" repeatCount="indefinite" />
                </path>
            </g>
        </CardContainer>
    </svg>
);

// Feature: Quality Fuel V2 (Crystal Drop)
export const QualityFuelImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <CardContainer>
            {/* Hexagon Shield Background */}
            <path d="M50 15 L80 30 L80 70 L50 85 L20 70 L20 30 Z" fill="none" stroke="url(#grad-blue)" strokeWidth="1" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite" />
            </path>

            {/* Inner Rotating Ring */}
            <circle cx="50" cy="50" r="25" stroke="url(#grad-blue)" strokeWidth="1" fill="none" strokeDasharray="10 5" opacity="0.5">
                <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="10s" repeatCount="indefinite" />
            </circle>

            {/* Premium Drop */}
            <g transform="translate(50, 50)">
                <path d="M0 -20 Q15 0 15 15 A15 15 0 0 1 -15 15 Q-15 0 0 -20 Z" fill="url(#grad-blue)" filter="url(#glow-orange)">
                    <animate attributeName="d" values="M0 -20 Q15 0 15 15 A15 15 0 0 1 -15 15 Q-15 0 0 -20 Z; M0 -18 Q14 2 14 14 A14 14 0 0 1 -14 14 Q-14 2 0 -18 Z; M0 -20 Q15 0 15 15 A15 15 0 0 1 -15 15 Q-15 0 0 -20 Z" dur="3s" repeatCount="indefinite" />
                </path>
                <path d="M-5 0 Q0 -5 5 0 M-8 8 Q0 15 8 8" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5">
                    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
                </path>
            </g>
        </CardContainer>
    </svg>
);

// Feature: 24/7 Availability V2 (Time Cycle)
export const AvailabilityImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <CardContainer>
            {/* Clock Face */}
            <circle cx="50" cy="50" r="30" stroke="url(#grad-purple)" strokeWidth="2" fill="none" opacity="0.5" />

            {/* Moving Sun/Moon Orbit */}
            <g transform="translate(50, 50)">
                <g>
                    <circle cx="0" cy="-30" r="4" fill="#fbbf24" filter="url(#glow-orange)" /> {/* Sun */}
                    <circle cx="0" cy="30" r="3" fill="#cbd5e1" opacity="0.8" />           {/* Moon */}
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                </g>
            </g>

            {/* Rotating Hands */}
            <line x1="50" y1="50" x2="50" y2="30" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="50" y1="50" x2="65" y2="50" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="12s" repeatCount="indefinite" />
            </line>

            {/* Center Pin */}
            <circle cx="50" cy="50" r="3" fill="#fff" />
        </CardContainer>
    </svg>
);

// Feature: Tracking V2 (Radar Map)
export const TrackingImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <CardContainer>
            {/* Radar Sweep */}
            <circle cx="50" cy="50" r="30" stroke="url(#grad-green)" strokeWidth="1" fill="none" opacity="0.3" />
            <circle cx="50" cy="50" r="15" stroke="url(#grad-green)" strokeWidth="1" fill="none" opacity="0.3" />

            <path d="M50 50 L50 20 A30 30 0 0 1 80 50" fill="url(#grad-green)" opacity="0.1">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite" />
            </path>

            {/* Map Pin Target */}
            <g transform="translate(50, 50)">
                <path d="M0 -15 C-10 -15 -15 -5 -15 0 C-15 10 0 25 0 25 C0 25 15 10 15 0 C15 -5 10 -15 0 -15" fill="none" stroke="url(#grad-green)" strokeWidth="2">
                    <animate attributeName="transform" type="translate" values="0,-5; 0,0; 0,-5" dur="2s" repeatCount="indefinite" />
                </path>
                <circle cx="0" cy="0" r="3" fill="#4ade80">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
                </circle>
            </g>

            {/* Pulse Rings */}
            <circle cx="50" cy="50" r="5" stroke="#4ade80" strokeWidth="1" fill="none" opacity="0">
                <animate attributeName="r" values="5;30" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
            </circle>
        </CardContainer>
    </svg>
);

// Feature: Payment V2 (Digital Secure)
export const PaymentImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <CardContainer>
            {/* Card Backing */}
            <rect x="25" y="35" width="50" height="35" rx="4" fill="url(#grad-pink)" fillOpacity="0.1" stroke="#ec4899" strokeWidth="1" transform="rotate(-5 50 50)" />

            {/* Main Floating Card */}
            <g transform="translate(50, 45) rotate(5)">
                <rect x="-30" y="-20" width="60" height="40" rx="4" fill="#1e293b" stroke="#ec4899" strokeWidth="1">
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="4s" repeatCount="indefinite" />
                </rect>
                <rect x="-30" y="-12" width="60" height="6" fill="#ec4899" opacity="0.3" />
                <circle cx="-20" cy="5" r="4" fill="#fb7185" />
                <rect x="-10" y="2" width="20" height="6" rx="2" fill="#fff" opacity="0.3" />
            </g>

            {/* Shield Overlay */}
            <path d="M70 60 L75 65 L75 75 L70 80 L65 75 L65 65 Z" fill="#ec4899" filter="url(#glow-orange)">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M70 65 L73 68 L70 73 L67 68 Z" fill="white" />
        </CardContainer>
    </svg>
);
// Define Pink Grad if missing or reuse purple? I'll assume pink grad is needed or use hardcoded pinks. 
// Actually I need to define #grad-pink in TextureDefs if I use it. I used #ec4899 mostly. 
// I'll stick to hardcoded colors or existing gradients to avoid error if `grad-pink` isn't defined.
// The code above uses `url(#grad-pink)`. I must ensure it exists.
// Checking TextureDefs... I see orange, blue, purple. No pink. 
// I will use `grad-purple` or define pink locally in the SVG if possible? No, TextureDefs is global.
// I will just use hex code for fill.


// Feature: Support V2 (Active Chat)
export const SupportImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <CardContainer>
            {/* Headset Shape */}
            <path d="M30 60 V45 A20 20 0 0 1 70 45 V60" stroke="#eab308" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="22" y="55" width="16" height="20" rx="4" fill="#eab308" />
            <rect x="62" y="55" width="16" height="20" rx="4" fill="#eab308" />

            {/* Mic */}
            <path d="M70 70 Q50 90 40 70" stroke="#eab308" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="40" cy="70" r="2" fill="#fbbf24" />

            {/* Sound Waves / Chat Activity */}
            <g transform="translate(50, 30)">
                <circle cx="0" cy="0" r="2" fill="#fbbf24">
                    <animate attributeName="r" values="2;5;2" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
                </circle>
                <line x1="-10" y1="0" x2="-10" y2="0" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
                    <animate attributeName="y1" values="0;-5;0" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="y2" values="0;5;0" dur="1s" repeatCount="indefinite" />
                </line>
                <line x1="10" y1="0" x2="10" y2="0" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
                    <animate attributeName="y1" values="0;-5;0" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="y2" values="0;5;0" dur="1s" repeatCount="indefinite" />
                </line>
            </g>
        </CardContainer>
    </svg>
);


// How It Works Step 1: Place Order (Mobile)
export const HowStep1Image = ({ className = "w-full h-auto" }: { className?: string }) => (
    <svg viewBox="0 0 300 180" className={className}>
        <TextureDefs />
        <rect x="0" y="0" width="300" height="180" rx="12" fill="url(#card-bg)" />


        {/* Phone Mockup */}
        <g transform="translate(110, 20)">
            <rect x="0" y="0" width="80" height="140" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            {/* Screen */}
            <rect x="4" y="10" width="72" height="120" rx="0" fill="#0f172a" />
            {/* App UI */}
            <rect x="14" y="25" width="52" height="8" rx="2" fill="#334155" />
            <rect x="14" y="40" width="52" height="20" rx="2" fill="#334155" />
            <rect x="16" y="44" width="20" height="3" fill="#f97316" />

            <rect x="14" y="70" width="52" height="20" rx="2" fill="#334155" />
            {/* Button */}
            <rect x="14" y="100" width="52" height="12" rx="4" fill="url(#grad-orange)" />
        </g>
    </svg>
);

// How It Works Step 2: Track (Map)
export const HowStep2Image = ({ className = "w-full h-auto" }: { className?: string }) => (
    <svg viewBox="0 0 300 180" className={className}>
        <TextureDefs />
        <rect x="0" y="0" width="300" height="180" rx="12" fill="url(#card-bg)" />


        {/* Map Grid */}
        <path d="M50 20 V160 M150 20 V160 M250 20 V160 M20 50 H280 M20 100 H280 M20 150 H280" stroke="#334155" strokeWidth="1" opacity="0.5" />

        {/* Path */}
        <path d="M60 140 Q150 140 150 90 Q150 40 240 40" stroke="url(#grad-orange)" strokeWidth="3" fill="none" strokeDasharray="8 4" />
        <circle cx="60" cy="140" r="4" fill="#334155" />
        <circle cx="240" cy="40" r="6" fill="#22c55e" stroke="white" strokeWidth="2" />

        {/* Truck Marker */}
        <g transform="translate(140, 80)">
            <circle cx="10" cy="10" r="16" fill="#f97316" fillOpacity="0.2" />
            <rect x="0" y="2" width="20" height="12" rx="2" fill="#f97316" />
            <circle cx="5" cy="14" r="3" fill="#fff" />
            <circle cx="15" cy="14" r="3" fill="#fff" />
        </g>
    </svg>
);

// How It Works Step 3: Receive (Car/Bike)
export const HowStep3Image = ({ className = "w-full h-auto" }: { className?: string }) => (
    <svg viewBox="0 0 300 180" className={className}>
        <TextureDefs />
        <rect x="0" y="0" width="300" height="180" rx="12" fill="url(#card-bg)" />


        {/* Vehicle shapes simplified */}
        <path d="M50 120 L60 90 H100 L110 120 V140 H50 Z" fill="#3b82f6" opacity="0.8" />
        <circle cx="65" cy="140" r="10" fill="#1e293b" />
        <circle cx="95" cy="140" r="10" fill="#1e293b" />

        {/* Pump Hose */}
        <path d="M220 100 C200 100 160 80 140 110" stroke="#fbbf24" strokeWidth="3" fill="none" />
        <rect x="135" y="105" width="10" height="15" fill="#f97316" />

        {/* "Full" Indicator Pop */}
        <g transform="translate(180, 50)">
            <rect x="0" y="0" width="60" height="30" rx="15" fill="#22c55e" />
            <text x="30" y="20" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="bold">FULL</text>
        </g>
    </svg>
);

// Additional Features
export const MobileAppImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <CardContainer>
            <rect x="35" y="25" width="30" height="50" rx="4" stroke="#f97316" strokeWidth="2" fill="none" />
            <rect x="40" y="30" width="20" height="30" fill="url(#grad-orange)" opacity="0.5" />
        </CardContainer>
    </svg>
);

export const NotificationImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <CardContainer>
            <path d="M50 30 Q65 30 65 50 V60 H35 V50 Q35 30 50 30" fill="url(#grad-orange)" />
            <circle cx="50" cy="65" r="3" fill="#f97316" />
        </CardContainer>
    </svg>
);

export const AnalyticsImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <CardContainer>
            <line x1="20" y1="80" x2="80" y2="80" stroke="#334155" strokeWidth="2" />
            <line x1="20" y1="20" x2="20" y2="80" stroke="#334155" strokeWidth="2" />
            <rect x="30" y="50" width="10" height="30" fill="#22c55e" />
            <rect x="45" y="40" width="10" height="40" fill="#3b82f6" />
            <rect x="60" y="30" width="10" height="50" fill="#f97316" />
        </CardContainer>
    </svg>
);

export const SecurityImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <CardContainer>
            <rect x="35" y="45" width="30" height="25" rx="2" fill="#ef4444" />
            <path d="M40 45 V35 A10 10 0 0 1 60 35 V45" stroke="#ef4444" strokeWidth="3" fill="none" />
        </CardContainer>
    </svg>
);

export const FleetImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <CardContainer>
            <rect x="25" y="40" width="30" height="20" fill="#94a3b8" />
            <rect x="50" y="50" width="25" height="15" fill="#94a3b8" />
            <circle cx="35" cy="65" r="5" fill="#fff" />
            <circle cx="60" cy="65" r="5" fill="#fff" />
        </CardContainer>
    </svg>
);

export const RewardsImage = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <CardContainer>
            <circle cx="50" cy="45" r="15" fill="#eab308" />
            <path d="M50 45 L40 70 L50 65 L60 70 Z" fill="#ca8a04" />
        </CardContainer>
    </svg>
);
// ... existing code ...

export const AboutHeroImage = ({ className = "w-full h-64" }: { className?: string }) => (
    <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
        <TextureDefs />

        {/* Central Glow */}
        <circle cx="200" cy="150" r="80" fill="url(#grad-orange)" opacity="0.1" filter="url(#glow-orange)" />
        <circle cx="200" cy="150" r="60" fill="url(#grad-blue)" opacity="0.1" filter="url(#glow-orange)" />

        {/* Group for Hands */}
        <g transform="translate(200, 150) scale(0.8)">
            {/* FuelMate Arm (Left) - Orange/Tech */}
            <g transform="translate(-140, 20)">
                {/* Arm Sleeve */}
                <path d="M-60 40 L60 -20" stroke="url(#grad-orange)" strokeWidth="45" strokeLinecap="round" />
                {/* Cuff detail */}
                <path d="M40 -10 L50 -15" stroke="#fff" strokeWidth="2" opacity="0.5" />

                {/* Hand/Thumb Base */}
                <path d="M60 -20 Q80 -30 90 -10 L100 10" fill="#fdba74" stroke="none" />

                {/* FuelMate Logo on Sleeve */}
                <circle cx="0" cy="10" r="12" fill="#fff" opacity="0.2" />
                <path d="M0 4 L0 16" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
            </g>

            {/* Customer Arm (Right) - Blue/Corporate */}
            <g transform="translate(50, -30)">
                {/* Arm Sleeve */}
                <path d="M140 30 L20 90" stroke="#334155" strokeWidth="45" strokeLinecap="round" />
                {/* Cuff detail */}
                <path d="M40 80 L30 85" stroke="#94a3b8" strokeWidth="2" opacity="0.5" />

                {/* Hand Base */}
                <path d="M20 90 Q0 100 -10 80 L-20 60" fill="#cbd5e1" stroke="none" />
            </g>

            {/* The Clasp (Stylized Overlap) */}
            <g transform="translate(-20, 20)">
                {/* Right Hand Fingers wrapping Left Hand */}
                <path d="M-10 -10 Q10 -20 30 -10 L40 20 Q20 30 0 20 Z" fill="#cbd5e1" />

                {/* Left Hand Thumb wrapping Top */}
                <path d="M-15 -15 Q0 -25 20 -15 L25 5" fill="#fdba74" />
            </g>
        </g>

        {/* Floating Elements (Structured feel) */}
        <rect x="50" y="50" width="20" height="20" rx="4" stroke="url(#grad-orange)" strokeWidth="1" fill="none" opacity="0.3" className="animate-pulse" />
        <rect x="330" y="230" width="15" height="15" rx="3" stroke="url(#grad-blue)" strokeWidth="1" fill="none" opacity="0.3" className="animate-pulse" style={{ animationDelay: '1s' }} />
        <circle cx="350" cy="60" r="4" fill="#fb923c" opacity="0.4" />
        <circle cx="40" cy="240" r="6" fill="#60a5fa" opacity="0.4" />
    </svg>
);

// ... existing code ...

export const EmpathyIcon = ({ className = "w-24 h-24" }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <TextureDefs />
        {/* Ambient Glow */}
        <circle cx="100" cy="100" r="80" fill="url(#grad-orange)" opacity="0.1" filter="url(#glow-orange)" />

        {/* Orbital Rings - simulating 3D */}
        <g transform="translate(100, 100)">
            <ellipse rx="70" ry="20" fill="none" stroke="url(#grad-orange)" strokeWidth="1" opacity="0.3" transform="rotate(-45)">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite" />
            </ellipse>
            <ellipse rx="70" ry="20" fill="none" stroke="url(#grad-orange)" strokeWidth="1" opacity="0.3" transform="rotate(45)">
                <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="10s" repeatCount="indefinite" />
            </ellipse>
        </g>

        {/* Central Heart - Levitation */}
        <g transform="translate(100, 100)">
            <path d="M0 20 Q-30 -10 -30 -30 A 25 25 0 0 1 0 -50 A 25 25 0 0 1 30 -30 Q30 -10 0 20 Z" fill="url(#grad-orange)" filter="url(#glow-orange)">
                <animateTransform attributeName="transform" type="translate" values="0,0; 0,-5; 0,0" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
            </path>
        </g>

        {/* Floating Particles */}
        <circle cx="60" cy="140" r="2" fill="#fb923c" opacity="0.6">
            <animate attributeName="cy" from="140" to="60" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="140" cy="120" r="3" fill="#fb923c" opacity="0.4">
            <animate attributeName="cy" from="120" to="40" dur="5s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="5s" begin="1s" repeatCount="indefinite" />
        </circle>
    </svg>
);

export const SustainabilityIcon = ({ className = "w-24 h-24" }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <TextureDefs />
        <defs>
            <linearGradient id="grad-green-v2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
        </defs>

        {/* Background Hex Grid */}
        <g opacity="0.2">
            <path d="M100 20 L150 50 L150 110 L100 140 L50 110 L50 50 Z" stroke="url(#grad-green-v2)" strokeWidth="1" fill="none" transform="rotate(15 100 80)" />
            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="60s" repeatCount="indefinite" />
        </g>

        {/* Central Sphere container */}
        <circle cx="100" cy="100" r="50" fill="url(#grad-green-v2)" opacity="0.1" />
        <circle cx="100" cy="100" r="50" stroke="url(#grad-green-v2)" strokeWidth="1" fill="none" strokeDasharray="10 10" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="20s" repeatCount="indefinite" />
        </circle>

        {/* The Leaf - Living Animation */}
        <g transform="translate(100, 100)">
            <g>
                <path d="M0 40 Q-40 0 0 -40 Q40 0 0 40 Z" fill="url(#grad-green-v2)" opacity="0.9" filter="url(#glow-orange)">
                    <animate attributeName="d" values="M0 40 Q-40 0 0 -40 Q40 0 0 40 Z; M0 35 Q-35 -5 0 -45 Q35 -5 0 35 Z; M0 40 Q-40 0 0 -40 Q40 0 0 40 Z" dur="4s" repeatCount="indefinite" />
                </path>
                <path d="M0 40 L0 -20" stroke="#064e3b" strokeWidth="2" opacity="0.3" />
            </g>
        </g>

        {/* Energy Bubbles */}
        <circle cx="110" cy="120" r="4" fill="#4ade80">
            <animate attributeName="cy" values="120;70" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
        </circle>
    </svg>
);

export const AccessibilityIcon = ({ className = "w-24 h-24" }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <TextureDefs />

        {/* Hologram Base */}
        <ellipse cx="100" cy="160" rx="60" ry="15" fill="none" stroke="url(#grad-blue)" strokeWidth="2" opacity="0.5" />
        <ellipse cx="100" cy="160" rx="40" ry="10" fill="none" stroke="url(#grad-blue)" strokeWidth="1" opacity="0.3" />

        {/* Projecting Cone */}
        <path d="M40 160 L100 40 L160 160" fill="url(#grad-blue)" opacity="0.05" />

        {/* The Globe - Wireframe Orbiting */}
        <g transform="translate(100, 90)">
            <circle cx="0" cy="0" r="45" fill="none" stroke="url(#grad-blue)" strokeWidth="1" opacity="0.3" />
            <ellipse rx="45" ry="15" fill="none" stroke="url(#grad-blue)" strokeWidth="1" opacity="0.4" transform="rotate(-20)">
                <animateTransform attributeName="transform" type="rotate" values="0;360" dur="15s" repeatCount="indefinite" />
            </ellipse>
            <ellipse rx="15" ry="45" fill="none" stroke="url(#grad-blue)" strokeWidth="1" opacity="0.4" transform="rotate(20)">
                <animateTransform attributeName="transform" type="rotate" values="360;0" dur="15s" repeatCount="indefinite" />
            </ellipse>
        </g>

        {/* Active Ping */}
        <circle cx="100" cy="90" r="5" fill="#60a5fa" filter="url(#glow-orange)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
        </circle>

        {/* Scanning Line */}
        <rect x="55" y="45" width="90" height="2" fill="#93c5fd" opacity="0.5">
            <animate attributeName="y" values="45;135;45" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
        </rect>
    </svg>
);

export const InnovationIcon = ({ className = "w-24 h-24" }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <TextureDefs />

        {/* Reactive Core */}
        <circle cx="100" cy="100" r="20" fill="white" filter="url(#glow-orange)">
            <animate attributeName="r" values="20;25;20" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;1;0.8" dur="0.5s" repeatCount="indefinite" />
        </circle>

        {/* Spinning Reactor Rings */}
        <g transform="translate(100, 100)">
            <g>
                <path d="M-50 0 L-30 0 M30 0 L50 0 M0 -50 L0 -30 M0 30 L0 50" stroke="url(#grad-orange)" strokeWidth="4" strokeLinecap="round" />
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
            </g>
            <g opacity="0.5">
                <circle r="60" fill="none" stroke="url(#grad-orange)" strokeWidth="1" strokeDasharray="20 40" />
                <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="10s" repeatCount="indefinite" />
            </g>
        </g>

        {/* Lightning Arcs */}
        <path d="M100 100 L140 60" stroke="#fdba74" strokeWidth="2" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="0.2s" begin="0s" repeatCount="indefinite" />
            <animate attributeName="d" values="M100 100 L120 80 L140 60; M100 100 L110 90 L130 50" dur="0.2s" repeatCount="indefinite" />
        </path>
        <path d="M100 100 L60 140" stroke="#fdba74" strokeWidth="2" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="0.3s" begin="0.1s" repeatCount="indefinite" />
        </path>
        <path d="M100 100 L140 140" stroke="#fdba74" strokeWidth="2" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="0.4s" begin="0.2s" repeatCount="indefinite" />
        </path>
    </svg>
);
