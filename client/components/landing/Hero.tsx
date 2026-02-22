import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles size={12} className="animate-pulse text-orange-500" />
                            <span>On-Demand Fuel Intelligence</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                            Fuel delivered
                            <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                Anywhere, Anytime
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-xl text-gray-400 max-w-2xl">
                            Never run out of fuel again. Get premium quality fuel delivered directly to your vehicle. Fast, reliable, and convenient.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/auth">
                                <Button
                                    size="lg"
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 text-lg group rounded-md shadow-lg shadow-orange-500/10"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </Button>
                            </Link>
                            <a href="#features">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-slate-700 text-white hover:bg-slate-800 px-8 py-6 text-lg"
                                >
                                    Learn More
                                </Button>
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 pt-8">
                            <div>
                                <div className="text-3xl font-bold text-white">10K+</div>
                                <div className="text-sm text-gray-400">Happy Customers</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">50+</div>
                                <div className="text-sm text-gray-400">Partner Stations</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">24/7</div>
                                <div className="text-sm text-gray-400">Available</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Hero Image */}
                    <div className="relative">
                        <div className="relative z-10">
                            <img
                                src="/fuel_delivery_hero.png"
                                alt="Fuel Delivery Service"
                                className="w-full h-auto rounded-lg shadow-2xl border border-slate-800"
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
    );
};

export default Hero;
