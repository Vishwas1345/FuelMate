import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Construction, HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
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
    <div className="min-h-screen bg-[#020617] flex flex-col relative overflow-hidden font-sans text-slate-200">
      <Navbar />
      
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      <main className="flex-grow flex items-center justify-center p-6 pt-28 pb-16 relative z-10">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          
          {/* Left Column: Visual & Heading */}
          <div className="lg:col-span-3 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-[0.2em]">
              <Construction className="w-3.5 h-3.5" />
              Under Construction
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
              CRAFTING THE <br />
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                FUEL EXPERIENCE
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
              Welcome back, <span className="text-white font-bold">{user?.name?.split(' ')[0] || 'Partner'}</span>. 
              The FuelMate Terminal is currently <span className="text-slate-100 font-semibold border-b border-orange-500/50">Under Construction</span>. 
              We're optimizing our delivery systems for peak efficiency. Your account remains fully secured and ready for departure.
            </p>
          </div>

          {/* Right Column: Status Card */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-8 rounded-[2.5rem] shadow-3xl relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-br from-orange-500/20 to-transparent rounded-[2.5rem] -z-10 group-hover:opacity-100 opacity-50 transition-opacity"></div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">System Status</h3>
                  <HardHat className="w-5 h-5 text-orange-500" />
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Core Architecture", status: "Operational", color: "text-emerald-400" },
                    { label: "User Databases", status: "Synchronized", color: "text-emerald-400" },
                    { label: "Payment Engine", status: "Encrypted", color: "text-blue-400" },
                    { label: "AI Dispatcher", status: "In Training", color: "text-orange-400" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center group/item hover:bg-slate-800/30 p-2 -m-2 rounded-xl transition-colors">
                      <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                      <span className={`${item.color} text-[10px] font-bold uppercase tracking-tighter bg-slate-900/50 px-2 py-1 rounded-md border border-slate-800`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleLogout}
                    className="w-full bg-white hover:bg-slate-100 text-black font-bold h-12 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-white/5"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    TERMINATE SESSION
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnderConstruction;
