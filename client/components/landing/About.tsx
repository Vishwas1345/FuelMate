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
                        <div className="inline-block px-3 py-1 bg-slate-900 border border-slate-800 rounded text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                            Intelligence Dashboard
                        </div>

                        <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight uppercase tracking-tighter">
                            Fuel Logistic
                            <span className="block text-orange-500">
                                REIMAGINED
                            </span>
                        </h2>

                        <div className="space-y-4 text-slate-400 text-lg leading-relaxed font-medium">
                            <p>
                                FuelMate is a high-performance logistics platform designed to optimize energy distribution. We provide enterprise-grade fuel delivery directly to your fleet or personal vehicle.
                            </p>
                        </div>

                        {/* Values */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <div className="space-y-2 border-l-2 border-slate-800 pl-4">
                                <div className="text-white font-semibold uppercase text-xs tracking-widest">Core Vision</div>
                                <p className="text-slate-500 text-xs font-medium">Global energy accessibility and distribution optimization.</p>
                            </div>
                            <div className="space-y-2 border-l-2 border-slate-800 pl-4">
                                <div className="text-white font-semibold uppercase text-xs tracking-widest">Compliance</div>
                                <p className="text-slate-500 text-xs font-medium">Tier-1 security and certified energy handling standards.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Stats */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
                            <h3 className="text-sm font-semibold text-white mb-8 uppercase tracking-widest">Operational Metadata</h3>

                            <div className="grid grid-cols-2 gap-6">
                                {stats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="space-y-3 p-6 bg-slate-950 border border-slate-800 rounded-md hover:border-orange-500/50 transition-colors duration-300"
                                    >
                                        <div className="inline-flex p-2 bg-slate-900 rounded border border-slate-800 text-orange-500">
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className="text-3xl font-semibold text-white tracking-tighter">{stat.value}</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Team Section */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
                            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Partner Operations</h3>
                            <p className="text-slate-500 mb-6 text-sm font-medium leading-relaxed">
                                Join our network of certified energy distribution partners. Scale your station's reach through our logistics layer.
                            </p>
                            <a
                                href="#contact"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-md transition-colors duration-200 text-xs uppercase tracking-widest"
                            >
                                Contact Operations
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
