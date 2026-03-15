import { useNavigate } from 'react-router-dom';
import { Hammer, Sparkles, Layout, ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogoIcon } from '@/components/Logo';

const UnderConstruction = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-2xl w-full relative z-10 px-6 py-12 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl text-center">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="relative group">
            <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/30 transition-all duration-500"></div>
            <LogoIcon className="w-16 h-16 text-orange-500 relative z-10" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium mb-6">
          <Hammer className="w-4 h-4 animate-bounce" />
          <span>Building the Future of Fuel</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          Welcome to <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">FuelMate</span>
        </h1>
        
        <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed">
          Hello <span className="text-white font-semibold">{user?.name || 'there'}</span>! We've received your account registration. 
          Our main dashboard is currently undergoing a <span className="text-orange-400">high-tech maintenance</span> overhaul to give you the best experience possible.
        </p>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
          {[
            { icon: <Layout className="w-5 h-5" />, title: "Precision Dashboard", desc: "Live fuel price tracking" },
            { icon: <ShieldCheck className="w-5 h-5" />, title: "Secure Payments", desc: "Integrated payment gateways" },
            { icon: <Sparkles className="w-5 h-5" />, title: "AI Deployment", desc: "Smart route optimization" },
            { icon: < Hammer className="w-5 h-5" />, title: "Partner Network", desc: "Scaling across 500+ stations" },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-4 hover:bg-slate-800/60 transition-colors group">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-orange-500 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="border-slate-700 hover:bg-slate-800 text-slate-300 rounded-full px-8 h-12 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button 
            onClick={handleLogout}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 h-12 shadow-lg shadow-orange-950/20 transition-all font-bold"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Footer Note */}
        <p className="mt-12 text-xs text-slate-500 uppercase tracking-widest font-semibold">
          Expected Launch in <span className="text-orange-500/80">3-4 Weeks</span>
        </p>
      </div>
    </div>
  );
};

export default UnderConstruction;
