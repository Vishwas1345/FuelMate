import { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    className?: string;
}

export const MobileScrollSlider = ({ children, className = "" }: Props) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showArrow, setShowArrow] = useState(true);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Hide arrow if we are within 20px of the end
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
            setShowArrow(false);
        } else {
            setShowArrow(true);
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            // Also check on resize in case view changes
            window.addEventListener('resize', checkScroll);

            // Initial check
            checkScroll();

            return () => {
                el.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, []);

    return (
        <div className="relative">
            {/* Mobile Scroll Hint Arrow & Gradient Fade */}
            <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 md:hidden pointer-events-none bg-gradient-to-l from-slate-950 via-slate-950/0 to-transparent w-16 h-full flex items-center justify-end pr-2 transition-opacity duration-300 ${showArrow ? 'opacity-100' : 'opacity-0'}`}
            >
                <ArrowRight className="w-8 h-8 text-orange-500 animate-pulse drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            </div>

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className={className}
            >
                {children}
            </div>
        </div>
    );
};
