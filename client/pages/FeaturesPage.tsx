import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTASection from '@/components/landing/CTASection';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import {
    HeroFeatureImage,
    FastDeliveryImage,
    QualityFuelImage,
    AvailabilityImage,
    TrackingImage,
    PaymentImage,
    SupportImage,
    MobileAppImage,
    NotificationImage,
    AnalyticsImage,
    SecurityImage,
    FleetImage,
    RewardsImage,
    HowStep1Image,
    HowStep2Image,
    HowStep3Image
} from '@/components/FeatureIllustrations';
import { MobileScrollSlider } from '@/components/ui/MobileScrollSlider';

const FeaturesPage = () => {
    const mainFeatures = [
        {
            image: <FastDeliveryImage className="w-full h-auto shadow-lg rounded-2xl" />,
            title: 'Lightning Fast Delivery',
            description: 'Get fuel delivered to your location within 30 minutes. Our efficient network ensures quick service every time.',
            details: [
                'Average delivery time: 25-30 minutes',
                'Real-time ETA updates',
                'Priority delivery options available',
                'Express service for emergencies',
            ],
            gradient: 'from-orange-500 to-orange-600',
        },
        {
            image: <QualityFuelImage className="w-full h-auto shadow-lg rounded-2xl" />,
            title: 'Premium Quality Fuel',
            description: 'We source only the highest quality fuel from certified suppliers. Your vehicle deserves the best.',
            details: [
                'Certified fuel from top refineries',
                'Regular quality testing',
                'Multiple fuel grade options',
                'Additive-free premium fuel available',
            ],
            gradient: 'from-blue-500 to-blue-600',
        },
        {
            image: <AvailabilityImage className="w-full h-auto shadow-lg rounded-2xl" />,
            title: '24/7 Availability',
            description: 'Need fuel at 3 AM? No problem. Our service is available round the clock, every day of the year.',
            details: [
                'No holidays or downtime',
                'Night delivery available',
                'Weekend service included',
                'Emergency fuel delivery',
            ],
            gradient: 'from-purple-500 to-purple-600',
        },
        {
            image: <TrackingImage className="w-full h-auto shadow-lg rounded-2xl" />,
            title: 'Real-Time Tracking',
            description: 'Track your delivery in real-time with our advanced GPS system. Know exactly when your fuel will arrive.',
            details: [
                'Live GPS tracking',
                'Driver location updates',
                'Estimated arrival time',
                'Route optimization',
            ],
            gradient: 'from-green-500 to-green-600',
        },
        {
            image: <PaymentImage className="w-full h-auto shadow-lg rounded-2xl" />,
            title: 'Secure Payments',
            description: 'Multiple payment options with bank-grade security. Pay with cards, wallets, or cash on delivery.',
            details: [
                'Credit/Debit card payments',
                'Digital wallet integration',
                'Cash on delivery option',
                'Instant payment receipts',
            ],
            gradient: 'from-pink-500 to-pink-600',
        },
        {
            image: <SupportImage className="w-full h-auto shadow-lg rounded-2xl" />,
            title: 'Dedicated Support',
            description: 'Our customer support team is always ready to help. Get assistance whenever you need it.',
            details: [
                '24/7 customer support',
                'Multi-channel support (phone, chat, email)',
                'Dedicated account managers',
                'Quick issue resolution',
            ],
            gradient: 'from-yellow-500 to-yellow-600',
        },
    ];

    const additionalFeatures = [
        {
            image: <MobileAppImage className="w-16 h-16 rounded-xl" />,
            title: 'Mobile App',
            description: 'Order fuel on-the-go with our intuitive mobile application',
        },
        {
            image: <NotificationImage className="w-16 h-16 rounded-xl" />,
            title: 'Smart Notifications',
            description: 'Get instant updates about your order status and delivery',
        },
        {
            image: <AnalyticsImage className="w-16 h-16 rounded-xl" />,
            title: 'Usage Analytics',
            description: 'Track your fuel consumption and spending patterns',
        },
        {
            image: <SecurityImage className="w-16 h-16 rounded-xl" />,
            title: 'Data Security',
            description: 'Your personal and payment data is encrypted and secure',
        },
        {
            image: <FleetImage className="w-16 h-16 rounded-xl" />,
            title: 'Fleet Management',
            description: 'Manage multiple vehicles with our business solutions',
        },
        {
            image: <RewardsImage className="w-16 h-16 rounded-xl" />,
            title: 'Loyalty Rewards',
            description: 'Earn points with every order and get exclusive benefits',
        },
    ];

    const howItWorks = [
        {
            image: <HowStep1Image className="w-full h-48 mb-6" />,
            step: '01',
            title: 'Place Your Order',
            description: 'Select your location, fuel type, and quantity through our app or website',
        },
        {
            image: <HowStep2Image className="w-full h-48 mb-6" />,
            step: '02',
            title: 'Track Delivery',
            description: 'Monitor your delivery in real-time with live GPS tracking and ETA updates',
        },
        {
            image: <HowStep3Image className="w-full h-48 mb-6" />,
            step: '03',
            title: 'Receive Your Fuel!',
            description: 'Get your fuel delivered to your vehicle safely!',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 bg-slate-950 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="flex justify-center mb-6 sm:mb-8">
                        <div className="animate-float">
                            <HeroFeatureImage className="w-24 h-24 sm:w-32 sm:h-32" />
                        </div>
                    </div>

                    <div className="animate-fade-in-up delay-100 inline-flex items-center px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                        Features & Capabilities
                    </div>

                    <h1 className="animate-fade-in-up delay-200 text-4xl sm:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight max-w-4xl mx-auto">
                        Everything You Need for
                        <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                            Seamless Fuel Delivery
                        </span>
                    </h1>

                    <p className="animate-fade-in-up delay-300 text-base sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                        Discover the powerful features that make FuelMate the most convenient and reliable service.
                    </p>

                    <div className="animate-fade-in-up delay-300 flex justify-center">
                        <Link to="/auth">
                            <Button
                                size="lg"
                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg group h-14"
                            >
                                Get Started
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Features Section */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <MobileScrollSlider className="flex overflow-x-auto snap-x snap-mandatory gap-4 p-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:p-0 scrollbar-hide">
                        {mainFeatures.map((feature, index) => (
                            <RevealOnScroll
                                key={index}
                                delay={index * 0.1}
                                className="w-[85vw] sm:w-[400px] flex-shrink-0 snap-center md:w-auto h-auto"
                            >
                                <div
                                    className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 hover:transform hover:scale-105 h-full relative overflow-hidden"
                                >
                                    {/* Image Container */}
                                    <div className="mb-6 transform transition-transform duration-300 group-hover:scale-105">
                                        {feature.image}
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-white mb-3 relative z-10">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed mb-6 relative z-10">
                                        {feature.description}
                                    </p>

                                    {/* Details List */}
                                    <ul className="space-y-2 relative z-10">
                                        {feature.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Hover effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 pointer-events-none`}></div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </MobileScrollSlider>
                </div>
            </section>

            {/* Additional Features Grid */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                                And Much <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">More</span>
                            </h2>
                            <p className="text-xl text-gray-400">Additional features to enhance your experience</p>
                        </div>
                    </RevealOnScroll>

                    <MobileScrollSlider className="flex overflow-x-auto snap-x snap-mandatory gap-4 p-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible md:p-0 scrollbar-hide">
                        {additionalFeatures.map((feature, index) => (
                            <RevealOnScroll
                                key={index}
                                delay={index * 0.1}
                                className="w-[70vw] sm:w-[300px] flex-shrink-0 snap-center md:w-auto"
                            >
                                <div className="group relative h-full">
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/20 to-blue-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                                    <div className="relative h-full flex items-start gap-4 p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl hover:bg-slate-900/80 transition-all duration-300">

                                        <div className="shrink-0 relative transform group-hover:scale-110 transition-transform duration-300">
                                            <div className="absolute inset-0 bg-orange-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                            <div className="relative z-10">
                                                {feature.image}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{feature.title}</h4>
                                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </MobileScrollSlider>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-slate-950" id="how-it-works">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                                How It <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Works</span>
                            </h2>
                            <p className="text-xl text-gray-400">Get fuel delivered in 3 simple steps</p>
                        </div>
                    </RevealOnScroll>

                    <div className="grid md:grid-cols-3 gap-8">
                        {howItWorks.map((item, index) => (
                            <RevealOnScroll key={index} delay={index * 0.2}>
                                <div className="group relative h-full">
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center h-full flex flex-col transition-all duration-300 group-hover:-translate-y-2 group-hover:border-orange-500/50 group-hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.3)]">

                                        {/* Image Container with zoom */}
                                        <div className="mb-6 flex justify-center transform transition-transform duration-500 group-hover:scale-105">
                                            <div className="w-full max-w-[200px] relative">
                                                <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                <div className="relative z-10">
                                                    {item.image}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:text-orange-400">
                                            {item.step}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-200 transition-colors">{item.title}</h3>
                                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{item.description}</p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <RevealOnScroll>
                <CTASection
                    title="Ready to Experience These Features?"
                    subtitle="Join thousands of satisfied customers and get your first delivery today"
                    showContact={true}
                />
            </RevealOnScroll>

            <Footer />
        </div>
    );
};

export default FeaturesPage;
