import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import {
    ArrowRight,
    Sparkles,
    CheckCircle,
    TrendingUp,
    Users,
    Award,
    Leaf
} from 'lucide-react';
import { FastDeliveryImage, QualityFuelImage, AvailabilityImage, TrackingImage } from '@/components/FeatureIllustrations';
import CTASection from '@/components/landing/CTASection';
import { MobileScrollSlider } from '@/components/ui/MobileScrollSlider';
const Home = () => {
    const initialTestimonials: any[] = [];

    const [testimonials, setTestimonials] = useState(initialTestimonials);
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let animationFrameId: number;

        const scroll = () => {
            if (!isPaused) {
                const oneSetWidth = scrollContainer.scrollWidth / 3;
                if (scrollContainer.scrollLeft >= oneSetWidth) {
                    scrollContainer.scrollLeft -= oneSetWidth;
                } else {
                    scrollContainer.scrollLeft += 1;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused, testimonials]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/reviews');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const uniqueReviews: any[] = [];
                        const seen = new Set();

                        data.forEach((r: any) => {
                            // Create a unique key based on name and message to identify duplicates
                            const key = `${r.name || ''}-${r.message || ''}`;
                            if (!seen.has(key)) {
                                seen.add(key);
                                uniqueReviews.push({
                                    name: r.name || 'Anonymous',
                                    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'User')}&background=random`,
                                    text: r.message,
                                    rating: r.rating || 5,
                                });
                            }
                        });
                        setTestimonials(uniqueReviews);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch custom reviews", err);
            }
        };

        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const benefits = [
        'Save time - No more waiting in gas station lines',
        'Premium quality fuel from certified suppliers',
        'Competitive pricing with transparent costs',
        'Eco-friendly delivery with optimized routes',
        'Flexible scheduling - Order anytime, anywhere',
        'Secure payment options with instant receipts',
    ];

    const features = [
        {
            icon: <FastDeliveryImage className="w-24 h-24" />,
            title: 'Lightning Fast',
            description: '25-30 min average delivery time',
            gradient: 'from-orange-500 to-orange-600'
        },
        {
            icon: <QualityFuelImage className="w-24 h-24" />,
            title: 'Premium Quality',
            description: 'Certified fuel from top suppliers',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            icon: <AvailabilityImage className="w-24 h-24" />,
            title: '24/7 Available',
            description: 'Order anytime, day or night',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            icon: <TrackingImage className="w-24 h-24" />,
            title: 'Real-Time Tracking',
            description: 'Track your delivery live on map',
            gradient: 'from-green-500 to-green-600'
        },
    ];

    const stats = [
        { icon: <Users className="w-6 h-6" />, value: '10,000+', label: 'Happy Customers' },
        { icon: <TrendingUp className="w-6 h-6" />, value: '50,000+', label: 'Deliveries Made' },
        { icon: <Award className="w-6 h-6" />, value: '4.9/5', label: 'Average Rating' },
        { icon: <Leaf className="w-6 h-6" />, value: '30%', label: 'CO₂ Reduced' },
    ];

    const fuelPartners = [
        {
            name: 'Hindustan Petroleum',
            image: '/hp_logo.png',
            description: 'Powering your journey with trust'
        },
        {
            name: 'Bharat Petroleum',
            image: '/Bharat_pertroleum_logo.png',
            description: 'Pure for Sure'
        },
        {
            name: 'Shell',
            image: '/shell_logo.png',
            description: 'Go Well'
        },
        {
            name: 'Nayara Energy',
            image: '/nayara_logo.webp',
            description: 'Fueling India\'s Progress'
        },
        {
            name: 'Indian Oil',
            image: '/Indian_oil_logo.png',
            description: 'The Energy of India'
        },
        {
            name: 'Reliance Petroleum',
            image: '/reliance_logo.png',
            description: 'Growth is Life'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-16">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left space-y-8">
                            {/* Badge */}
                            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium">
                                <Sparkles size={16} className="animate-pulse" />
                                <span>On-Demand Fuel Delivery</span>
                            </div>

                            {/* Heading */}
                            <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                Fuel Delivered
                                <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                    Anytime, Anywhere
                                </span>
                            </h1>

                            {/* Description */}
                            <p className="animate-fade-in-up delay-200 text-base sm:text-lg text-gray-400 max-w-2xl">
                                Never run out of fuel again. Get premium quality fuel delivered directly to your vehicle, anywhere, anytime. Fast, reliable, and convenient.
                            </p>

                            {/* CTA Buttons */}
                            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/auth">
                                    <Button
                                        size="lg"
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 text-base group"
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                                    </Button>
                                </Link>
                                <Link to="/features">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-slate-700 text-white hover:bg-slate-800 px-6 py-3 text-base"
                                    >
                                        Explore Features
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Content - Hero Image */}
                        <div className="relative animate-fade-in-up delay-200">
                            <div className="relative z-10">
                                <img
                                    src="/fuel_delivery_hero.png"
                                    alt="Fuel Delivery Service - On-demand fuel delivery to your location"
                                    className="w-full h-auto rounded-2xl shadow-2xl"
                                />
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-orange-500 rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Features Highlight Section */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Why Choose <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">FuelMate</span>
                            </h2>
                            <p className="text-lg text-gray-400">Experience the future of fuel delivery</p>
                        </div>
                    </RevealOnScroll>

                    {/* Why Choose Section with New Effects */}
                    <MobileScrollSlider className="flex overflow-x-auto snap-x snap-mandatory gap-4 p-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:overflow-visible md:p-0 scrollbar-hide">
                        {features.map((feature, index) => (
                            <RevealOnScroll
                                key={index}
                                delay={index * 0.1}
                                className="w-[85vw] sm:w-[350px] flex-shrink-0 snap-center md:w-auto"
                            >
                                <div className="group relative h-full">
                                    {/* Animated Gradient Border */}
                                    <div className={`absolute -inset-0.5 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-75 blur transition duration-500`}></div>

                                    {/* Card Content */}
                                    <div className="relative h-full bg-slate-950 border border-slate-800 rounded-3xl p-8 hover:bg-slate-900 transition-all duration-300 flex flex-col items-center text-center overflow-hidden">

                                        {/* Background Subtle Glow */}
                                        <div className={`absolute top-0 w-full h-full bg-gradient-to-b ${feature.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`}></div>

                                        {/* Icon Wrapper with Pop Effect */}
                                        <div className="relative mb-6 transform group-hover:scale-110 transition-transform duration-500">
                                            <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-40 blur-2xl rounded-full transition-opacity duration-500`}></div>
                                            <div className="relative z-10 drop-shadow-2xl">
                                                {feature.icon}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
                                        <p className="text-sm text-gray-400 relative z-10">{feature.description}</p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </MobileScrollSlider>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <RevealOnScroll>
                            <div className="space-y-6">
                                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                                    Unmatched <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Benefits</span>
                                </h2>
                                <p className="text-lg text-gray-400">
                                    Experience hassle-free fuel delivery with benefits that make your life easier
                                </p>
                                <div className="space-y-4">
                                    {benefits.map((benefit, index) => (
                                        <div
                                            key={index}
                                            className="group relative overflow-hidden rounded-xl bg-slate-900/50 border border-slate-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)]"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-4 flex items-start gap-4">
                                                <div className="mt-1 relative">
                                                    <div className="absolute inset-0 bg-orange-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
                                                    <CheckCircle className="w-6 h-6 text-orange-500 relative z-10" />
                                                </div>
                                                <p className="text-gray-300 group-hover:text-white transition-colors">{benefit}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll delay={0.2}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-2xl blur-2xl"></div>
                                <img
                                    src="/fast_delivery_mobile.png"
                                    alt="Fast Fuel Delivery App on Mobile"
                                    className="w-full h-auto rounded-2xl shadow-2xl border border-slate-700 relative z-10 transform hover:scale-[1.02] transition-transform duration-300"
                                />
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Fuel Partners Section */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Manifesting Fuel <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Partners</span>
                            </h2>
                            <p className="text-lg text-gray-400">We will deliver high-quality fuel from India's leading oil companies</p>
                        </div>
                    </RevealOnScroll>

                    <MobileScrollSlider className="flex overflow-x-auto snap-x snap-mandatory gap-4 p-6 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:p-0 scrollbar-hide">
                        {fuelPartners.map((partner, index) => (
                            <RevealOnScroll
                                key={index}
                                delay={index * 0.1}
                                className="w-[70vw] sm:w-[300px] flex-shrink-0 snap-center md:w-auto"
                            >
                                <div className="group relative h-full">
                                    {/* Gradient Border Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>

                                    <div className="relative h-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 hover:bg-slate-900/80 transition-all duration-300">
                                        {/* Inner Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg group-hover:drop-shadow-2xl">
                                            <img
                                                src={partner.image}
                                                alt={partner.name}
                                                className="h-20 w-auto object-contain transition-all duration-300"
                                            />
                                        </div>

                                        <div className="text-center relative z-10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 absolute inset-x-0 bottom-4">
                                            {/* Optional: Show description or interaction hints on hover if space permits, or just keep logo clean */}
                                            {/* Keeping it clean for now as per design */}
                                            <h3 className="text-xl font-bold text-white">{partner.name}</h3>
                                            <p className="text-sm text-gray-400 mt-2">{partner.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </MobileScrollSlider>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                What Our <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Customers Say</span>
                            </h2>
                            <button
                                onClick={() => document.getElementById('leave-review')?.scrollIntoView({ behavior: 'smooth' })}
                                className="text-sm text-gray-400 hover:text-orange-500 transition-colors underline decoration-orange-500/50 underline-offset-4 cursor-pointer focus:outline-none"
                            >
                                Submit a Review
                            </button>
                        </div>
                    </RevealOnScroll>

                    {/* Infinite Marquee Container */}
                    <div className="relative w-full overflow-hidden mask-gradient-sides group">
                        {/* Gradient Masks */}
                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>

                        {/* Scrolling Track */}
                        <div
                            ref={scrollRef}
                            className="flex gap-8 overflow-x-auto scrollbar-hide py-8"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            onTouchStart={() => setIsPaused(true)}
                            onTouchEnd={() => setIsPaused(false)}
                        >
                            {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="w-[350px] md:w-[400px] flex-shrink-0 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-orange-500/40 transition-all duration-300 hover:bg-slate-900/80 hover:shadow-[0_0_30px_-10px_rgba(249,115,22,0.15)] flex flex-col gap-4 group/card cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-orange-500 blur opacity-20 rounded-full group-hover/card:opacity-40 transition-opacity"></div>
                                            <img
                                                src={testimonial.image.startsWith('http') ? testimonial.image : `/${testimonial.image}`}
                                                alt={testimonial.name}
                                                className="relative w-14 h-14 rounded-full object-cover border-2 border-slate-700 group-hover/card:border-orange-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-lg group-hover/card:text-orange-400 transition-colors">{testimonial.name}</div>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'fill-orange-500 text-orange-500' : 'fill-slate-800 text-slate-800'}`}
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 italic text-base leading-relaxed pl-2 border-l-2 border-slate-700 group-hover/card:border-orange-500/50 transition-colors">
                                        "{testimonial.text}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <RevealOnScroll>
                <CTASection
                    title="Ready to Get Started?"
                    subtitle="Join thousands of satisfied customers and experience the future of fuel delivery today."
                    showContact={true}
                />
            </RevealOnScroll>

            <Footer />
        </div>
    );
};

export default Home;
