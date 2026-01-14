import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft, Home } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const UnderConstruction = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Navbar />

            <main className="flex-grow flex items-center justify-center relative overflow-hidden px-4 pt-24 pb-12">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 max-w-2xl w-full text-center">
                    {/* Icon with glow */}
                    <div className="mb-8 relative inline-block">
                        <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full animate-pulse"></div>
                        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl inline-flex items-center justify-center">
                            <Construction className="w-16 h-16 text-orange-500" />
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                        Under <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Construction</span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-xl mx-auto">
                        Welcome to the FuelMate App! You have successfully signed up.
                        <br />
                        <span className="text-sm mt-2 block opacity-75">
                            Our main application dashboard is currently being built to serve you better. We are working hard to bring you the best fuel delivery experience.
                        </span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            onClick={() => navigate('/')}
                            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-6 rounded-xl flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <Home className="w-5 h-5" />
                            Back to Home
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UnderConstruction;
