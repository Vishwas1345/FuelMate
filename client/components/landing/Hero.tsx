import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    Sparkles
} from 'lucide-react';

const Hero = () => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-16">
            {/* Background Architecture */}
            <div className="absolute inset-0 z-0">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

                {/* Animated Glows */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.12, 0.1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/15 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[120px]"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                <div className="grid lg:grid-cols-2 gap-10 items-center">

                    {/* Left Column: Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center lg:text-left space-y-5"
                    >
                        {/* Main Heading */}
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
                        >
                            Fuel Delivered
                            <span className="block mt-1">
                                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                                    Anywhere, Anytime.
                                </span>
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            variants={itemVariants}
                            className="text-base md:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
                        >
                            Ditch the gas station lines. Get high-quality, certified fuel delivered directly to your vehicle with just a tap. Faster than a coffee break.
                        </motion.p>

                        {/* Action Buttons */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
                        >
                            <Link to="/auth" className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                                <Button
                                    size="lg"
                                    className="relative w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 text-base rounded-xl shadow-2xl flex items-center gap-3 active:scale-95 transition-all"
                                >
                                    Start Fueling Now
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>

                            <Link to="/features">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto border-slate-800 bg-slate-900/40 backdrop-blur-md text-white hover:bg-slate-800 hover:border-slate-700 px-8 py-6 text-base rounded-xl transition-all active:scale-95"
                                >
                                    Explore Features
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Visual Elements */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                        className="relative hidden lg:block"
                    >
                        {/* Hero Image Wrapper */}
                        <div className="relative z-10 w-full max-w-[500px] ml-auto">
                            {/* Decorative Glow behind image */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500/10 via-blue-500/5 to-transparent rounded-[2.5rem] blur-3xl opacity-50" />

                            <div className="relative rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
                                <img
                                    src="/graphical_hero_v4.png"
                                    alt="FuelMate Delivery System - Premium Fuel Delivery Illustration"
                                    className="w-full h-auto object-cover"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-40" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer z-20">
                <div className="w-5 h-8 border-2 border-slate-800 rounded-full flex justify-center p-1">
                    <motion.div
                        animate={{
                            height: ['20%', '60%', '20%'],
                            y: [0, 10, 0]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1 bg-orange-500 rounded-full"
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
