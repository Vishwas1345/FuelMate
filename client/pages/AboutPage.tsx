import Navbar from '@/components/landing/Navbar';
import { useState } from 'react';
import Footer from '@/components/landing/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, Users, Award, TrendingUp, Heart, Leaf, Globe, Lightbulb, ArrowRight, Zap, Code, Rocket, ChevronDown, ChevronUp, Map, Truck, CheckCircle } from 'lucide-react';
import CTASection from '@/components/landing/CTASection';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { AboutHeroImage, EmpathyIcon, SustainabilityIcon, AccessibilityIcon, InnovationIcon } from '@/components/FeatureIllustrations';
import { MobileScrollSlider } from '@/components/ui/MobileScrollSlider';

const AboutPage = () => {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };
    const values = [
        {
            icon: <EmpathyIcon className="w-20 h-20" />,
            title: 'Customer Empathy',
            description: 'Born from real struggle, we understand the frustration of being stranded. We build solutions that truly help.',
            gradient: 'from-red-500 to-pink-600',
        },
        {
            icon: <SustainabilityIcon className="w-20 h-20" />,
            title: 'Sustainable Future',
            description: 'We optimize every route to minimize our carbon footprint, making fuel delivery eco-friendlier than individual trips.',
            gradient: 'from-green-500 to-emerald-600',
        },
        {
            icon: <AccessibilityIcon className="w-20 h-20" />,
            title: 'Accessibility',
            description: 'Fuel shouldn\'t be a luxury of location. We aim to bring energy to wherever you are, whenever you need it.',
            gradient: 'from-blue-500 to-cyan-600',
        },
        {
            icon: <InnovationIcon className="w-20 h-20" />,
            title: 'Student Innovation',
            description: 'Driven by fresh perspectives and academic excellence, pushing the boundaries of what simple logistics can achieve.',
            gradient: 'from-yellow-500 to-orange-600',
        },
    ];

    const timeline = [
        {
            year: '2024',
            title: 'The Spark',
            icon: <Zap className="w-6 h-6 text-white" />,
            description: 'It began with a daily commute to college. One ordinary day turned into a struggle—stranded with an empty tank, pushing my vehicle miles to the nearest pump with no help in sight. In that moment of exhaustion, the idea for FuelMate was born: why shouldn’t help come to you?',
        },
        {
            year: '2025',
            title: 'The Blueprint',
            icon: <Code className="w-6 h-6 text-white" />,
            description: 'The idea took shape on paper. Comprehensive documentation, system architecture, and detailed planning filled the nights. Development began in earnest, laying the groundwork for a revolutionary on-demand service. Although challenges led to a pause, the vision never faded.',
        },
        {
            year: '2026',
            title: 'The Revival',
            icon: <Rocket className="w-6 h-6 text-white" />,
            description: 'FuelMate is back, stronger than ever. Now evolving as a flagship college project, we are turning that initial frustration into a polished, working reality. With renewed motivation and support, we are building the future of fuel delivery.',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="animate-fade-in-up flex justify-center mb-10">
                        <AboutHeroImage className="w-full max-w-lg h-auto drop-shadow-2xl" />
                    </div>

                    <div className="animate-fade-in-up delay-100 inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6">
                        Our Journey
                    </div>
                    <h1 className="animate-fade-in-up delay-200 text-5xl sm:text-6xl font-bold text-white mb-6">
                        More Than Just a
                        <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                            College Project
                        </span>
                    </h1>
                    <p className="animate-fade-in-up delay-300 text-xl text-gray-400 max-w-3xl mx-auto">
                        A solution born availability, fueled by necessity, and built with passion.
                        Discover the story behind FuelMate.
                    </p>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                                Driving <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Principles</span>
                            </h2>
                            <p className="text-xl text-gray-400">The values that power our code and our mission</p>
                        </div>
                    </RevealOnScroll>

                    <MobileScrollSlider className="flex overflow-x-auto snap-x snap-mandatory gap-4 p-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:overflow-visible md:p-0 scrollbar-hide">
                        {values.map((value, index) => (
                            <RevealOnScroll
                                key={index}
                                delay={index * 0.1}
                                className="w-[85vw] sm:w-[320px] flex-shrink-0 snap-center md:w-auto"
                            >
                                <div className="group relative h-full">
                                    {/* Animated Gradient Border */}
                                    <div className={`absolute -inset-0.5 bg-gradient-to-br ${value.gradient} rounded-3xl opacity-0 group-hover:opacity-75 blur transition duration-500`}></div>

                                    {/* Card Content */}
                                    <div className="relative h-full bg-slate-950 border border-slate-800 rounded-3xl p-8 hover:bg-slate-900 transition-all duration-300 flex flex-col items-center text-center overflow-hidden">

                                        {/* Background Subtle Glow */}
                                        <div className={`absolute top-0 w-full h-full bg-gradient-to-b ${value.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`}></div>

                                        {/* Icon Wrapper with Pop Effect */}
                                        <div className="relative mb-8 transform group-hover:scale-110 transition-transform duration-500">
                                            <div className={`absolute inset-0 bg-gradient-to-r ${value.gradient} opacity-0 group-hover:opacity-40 blur-2xl rounded-full transition-opacity duration-500`}></div>
                                            <div className="relative z-10 drop-shadow-2xl">
                                                {value.icon}
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{value.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed relative z-10">{value.description}</p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </MobileScrollSlider>
                </div>
            </section>

            {/* My Story / Timeline Section */}
            <section className="py-24 bg-slate-950 relative">
                <div className="absolute inset-0 bg-slate-900/20 skew-y-3 transform origin-top-left -z-10 h-full w-full"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                                The <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Origin Story</span>
                            </h2>
                            <p className="text-xl text-gray-400">From a stranded student to a visionary solution</p>
                        </div>
                    </RevealOnScroll>

                    <div className="relative max-w-4xl mx-auto">
                        {/* Vertical Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-orange-500/20 via-orange-500 to-blue-500/20 rounded-full"></div>

                        <div className="space-y-12">
                            {timeline.map((item, index) => {
                                const isEven = index % 2 === 0;
                                return (
                                    <RevealOnScroll key={index} delay={index * 0.2}>
                                        <div className={`group relative flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                                            {/* Content Box */}
                                            <div className="w-full md:flex-1 relative z-10">
                                                <div className={`relative bg-slate-950 border border-slate-800 p-6 md:p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(249,115,22,0.3)] hover:-translate-y-1 overflow-visible ${isEven ? 'md:text-right' : 'md:text-left'} text-center md:text-left`}>

                                                    {/* Gradient Border Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>

                                                    {/* Mobile Icon (Integrated into Card Top) - Visible on Mobile Only */}
                                                    <div className="md:hidden absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-slate-950 border-4 border-orange-500 flex items-center justify-center z-20 shadow-lg">
                                                        <div className="text-white scale-75">
                                                            {item.icon}
                                                        </div>
                                                    </div>

                                                    <div className={`relative z-10 flex flex-col md:inline-flex md:items-center gap-2 md:gap-4 mb-3 pt-6 md:pt-0 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                                                        <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
                                                            {item.year}
                                                        </span>
                                                        <span className="h-px w-8 md:w-12 bg-slate-700 hidden md:block group-hover:bg-orange-500/50 transition-colors"></span>
                                                    </div>
                                                    <h3 className="relative z-10 text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 group-hover:text-orange-100 transition-colors">{item.title}</h3>
                                                    <p className="relative z-10 text-gray-400 leading-relaxed text-sm md:text-base group-hover:text-gray-300 transition-colors">{item.description}</p>
                                                </div>
                                            </div>

                                            {/* Center Icon (Desktop Only) */}
                                            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-slate-950 border-4 border-orange-500 items-center justify-center z-10 shadow-[0_0_20px_rgba(249,115,22,0.6)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.8)] transition-all duration-300">
                                                <div className="text-white transform group-hover:rotate-12 transition-transform duration-300">
                                                    {item.icon}
                                                </div>
                                            </div>

                                            {/* Spacer for other side layout (Desktop Only) */}
                                            <div className="hidden md:block flex-1"></div>
                                        </div>
                                    </RevealOnScroll>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <RevealOnScroll delay={0.1}>
                            <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-3xl p-10 h-full relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                    <Target size={120} className="text-orange-500" />
                                </div>
                                <div className="relative z-10">
                                    <div className="inline-flex p-3 bg-orange-500/20 rounded-lg text-orange-400 mb-6">
                                        <Target className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-semibold text-white mb-6">Our Mission</h3>
                                    <p className="text-gray-400 leading-relaxed text-lg">
                                        To ensure no one has to endure the struggle of being stranded without fuel. We strive to transform vehicle refueling from a chore into a seamless, on-demand service.
                                    </p>
                                </div>
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll delay={0.2}>
                            <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-3xl p-10 h-full relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                    <Rocket size={120} className="text-blue-500" />
                                </div>
                                <div className="relative z-10">
                                    <div className="inline-flex p-3 bg-blue-500/20 rounded-lg text-blue-400 mb-6">
                                        <Rocket className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-semibold text-white mb-6">Our Vision</h3>
                                    <p className="text-gray-400 leading-relaxed text-lg">
                                        To become the standard for academic innovation in logistics, demonstrating how smart technology can solve real-world daily problems.
                                    </p>
                                </div>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                                Frequently Asked <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Questions</span>
                            </h2>
                            <p className="text-xl text-gray-400">Everything you need to know about FuelMate</p>
                        </div>
                    </RevealOnScroll>

                    <div className="space-y-4">
                        {[
                            {
                                question: "Is FuelMate available 24/7?",
                                answer: "Yes! We operate round the clock to ensure you're never left stranded, no matter the time of day or night."
                            },
                            {
                                question: "How long does delivery take?",
                                answer: "Typically, our delivery partners arrive within 30-45 minutes depending on traffic and your distance from the nearest station."
                            },
                            {
                                question: "Is there a delivery fee?",
                                answer: "We charge a small, transparent convenience fee for delivery. The exact amount is shown before you confirm your order."
                            },
                            {
                                question: "What types of fuel do you deliver?",
                                answer: "We currently deliver Petrol and Diesel. We are working on expanding to include EV charging support in the future."
                            },
                            {
                                question: "Is it safe?",
                                answer: "Absolutely. Our delivery partners are trained professionals, and we use certified safety equipment for fuel transport."
                            },
                            {
                                question: "Can I schedule a delivery?",
                                answer: "Currently, we focus on on-demand emergency services, but scheduled deliveries for fleets are coming soon!"
                            }
                        ].map((faq, index) => (
                            <RevealOnScroll key={index} delay={index * 0.05}>
                                <div className="border border-slate-800 rounded-2xl bg-slate-900/30 overflow-hidden">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/50 transition-colors focus:outline-none"
                                    >
                                        <span className="text-lg font-medium text-white">{faq.question}</span>
                                        {openFaqIndex === index ? (
                                            <ChevronUp className="w-5 h-5 text-orange-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                    <div
                                        className={`transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-slate-800/50">
                                            {faq.answer}
                                        </div>
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
                    title="Be Part of the Innovation"
                    subtitle="Join us as we redefine the future of fuel delivery, one tank at a time."
                    showContact={true}
                />
            </RevealOnScroll>

            <Footer />
        </div>
    );
};

export default AboutPage;
