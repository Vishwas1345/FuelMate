import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTASectionProps {
    title?: string;
    subtitle?: string;
    showContact?: boolean;
}

const CTASection = ({
    title = "Ready to Get Started?",
    subtitle = "Join thousands of satisfied customers and experience the future of fuel delivery today.",
    showContact = true
}: CTASectionProps) => {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute inset-0 bg-grid-slate-800/[0.05] bg-[size:32px_32px]"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-8 md:p-12 text-center transform hover:scale-[1.01] transition-all duration-500 hover:border-orange-500/30 shadow-2xl overflow-hidden group">

                    {/* Glowing highlight effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-slate-700 rounded-full text-orange-400 text-sm font-medium mb-8 animate-fade-in-up">
                        <Sparkles size={16} className="animate-pulse" />
                        <span>Start Your Journey</span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        {title}
                    </h2>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link to="/auth" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-6 text-lg rounded-md shadow-lg hover:shadow-orange-500/25 transition-all duration-300 group/btn"
                            >
                                Get Started Now
                                <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={20} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
