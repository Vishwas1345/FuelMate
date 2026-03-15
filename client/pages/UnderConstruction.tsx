import { useNavigate } from 'react-router-dom';
import { Hammer, Sparkles, Layout, ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogoIcon } from '@/components/Logo';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const UnderConstruction = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-4 pt-20 pb-10 relative">
        {/* Dynamic Background Effects */}
        <div className="absolute top-1/4 -left-1/4 w-72 md:w-96 h-72 md:h-96 bg-orange-500/10 rounded-full blur-[100px] md:blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-72 md:w-96 h-72 md:h-96 bg-blue-500/10 rounded-full blur-[100px] md:blur-[120px] animate-pulse delay-700"></div>
        
        {/* Card Container */}
        <div className="max-w-xl w-full relative z-10 px-5 md:px-8 py-8 md:py-12 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl text-center">
          {/* Logo Icon */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative group">
              <div className="absolute -inset-3 bg-orange-500/20 rounded-full blur-lg group-hover:bg-orange-500/30 transition-all duration-500 animate-pulse"></div>
              <LogoIcon className="w-12 h-12 md:w-16 md:h-16 text-orange-500 relative z-10" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 md:mb-6">
            <Hammer className="w-3 h-3" />
            <span>Under Construction</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 tracking-tight leading-tight">
            The <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Future</span> is Near
          </h1>
          
          <p className="text-sm md:text-lg text-slate-400 mb-8 md:mb-10 max-w-sm md:max-w-lg mx-auto leading-relaxed px-2">
            Welcome <span className="text-white font-semibold">{user?.name?.split(' ')[0] || 'Partner'}</span>! We're refining our dashboard to bring you the fastest fuel delivery experience in the country.
          </p>

          {/* Feature Preview Grid - Smaller for Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10 text-left px-2">
            {[
              { icon: <Layout className="w-4 h-4" />, title: "Live Tracking", desc: "Real-time delivery status" },
              { icon: <ShieldCheck className="w-4 h-4" />, title: "Secure Pay", desc: "100% encrypted checkout" },
              { icon: <Sparkles className="w-4 h-4" />, title: "AI Routing", desc: "Smart 30-min deliveries" },
              { icon: <Hammer className="w-4 h-4" />, title: "Rewards", desc: "Earn points on every liter" },
            ].map((item, i) => (
              <div key={i} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3 hover:bg-slate-800/60 transition-colors group">
                <div className="p-1.5 md:p-2 rounded-lg bg-slate-900 border border-slate-700 text-orange-500 group-hover:scale-110 transition-transform flex-shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-xs md:text-sm truncate">{item.title}</h3>
                  <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button - Scaled for Mobile */}
          <div className="flex justify-center px-4">
            <Button 
              onClick={handleLogout}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 md:px-12 h-12 md:h-14 shadow-lg shadow-orange-950/20 transition-all font-bold text-base md:text-lg group"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5 mr-3 group-hover:-translate-x-0.5 transition-transform" />
              Sign Out Securely
            </Button>
          </div>

          <p className="mt-10 md:mt-12 text-[9px] md:text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">
            Fueling Excellence • 2026
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UnderConstruction;
