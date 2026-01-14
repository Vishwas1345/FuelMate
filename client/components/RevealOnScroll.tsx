import { useEffect, useRef, useState } from 'react';

interface RevealOnScrollProps {
    children: React.ReactNode;
    className?: string;
    delay?: number; // Adjust delay logic if passing seconds directly (0.1, 0.2)
}

export const RevealOnScroll = ({ children, className = "", delay = 0 }: RevealOnScrollProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect(); // Animate once
            }
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const style = delay ? { animationDelay: `${delay}s` } : {};

    return (
        <div
            ref={ref}
            className={`${className} ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={style}
        >
            {children}
        </div>
    );
};
