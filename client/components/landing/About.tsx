import { Target, Users, Award, TrendingUp } from 'lucide-react';

const About = () => {
    const stats = [
        { icon: <Users className="w-6 h-6" />, value: '10,000+', label: 'Active Users' },
        { icon: <TrendingUp className="w-6 h-6" />, value: '50,000+', label: 'Deliveries Made' },
        { icon: <Award className="w-6 h-6" />, value: '4.9/5', label: 'Customer Rating' },
        { icon: <Target className="w-6 h-6" />, value: '50+', label: 'Partner Stations' },
    ];

    return (
        <section id="about" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium">
                            About FuelMate
                        </div>

                        <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                            Revolutionizing Fuel Delivery
                            <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                One Tank at a Time
                            </span>
                        </h2>

                        <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
                            <p>
                                FuelMate was born from a simple idea: fuel delivery should be as easy as ordering food. We're transforming the way people refuel their vehicles by bringing premium quality fuel directly to them.
                            </p>
                            <p>
                                Our mission is to save you time and provide unparalleled convenience. Whether you're at home, at work, or anywhere in between, we ensure you never have to worry about running out of fuel again.
                            </p>
                            <p>
                                With a network of certified fuel stations and a team of professional delivery personnel, we guarantee quality, safety, and reliability in every delivery.
                            </p>
                        </div>

                        {/* Values */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <div className="space-y-2">
                                <div className="text-orange-500 font-semibold">Our Vision</div>
                                <p className="text-gray-400 text-sm">To become the world's most trusted on-demand fuel delivery platform</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-orange-500 font-semibold">Our Mission</div>
                                <p className="text-gray-400 text-sm">Making fuel delivery accessible, affordable, and environmentally conscious</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Stats */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-8">Our Impact</h3>

                            <div className="grid grid-cols-2 gap-6">
                                {stats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="space-y-3 p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-orange-500/50 transition-colors duration-300"
                                    >
                                        <div className="inline-flex p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-white">{stat.value}</div>
                                            <div className="text-sm text-gray-400">{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Team Section */}
                        <div className="bg-gradient-to-br from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-white mb-4">Join Our Growing Team</h3>
                            <p className="text-gray-400 mb-6">
                                We're always looking for passionate individuals to join our mission of revolutionizing fuel delivery.
                            </p>
                            <a
                                href="#contact"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
                            >
                                Get in Touch
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
