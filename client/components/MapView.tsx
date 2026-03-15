import React from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface MapViewProps {
  address: string;
}

const MapView = ({ address }: MapViewProps) => {
  // Logic to determine marker position based on address content for mock visualization
  const getMarkerPosition = (addr: string) => {
    const lowerAddr = addr.toLowerCase();
    
    // Neighborhood mapping for Surat simulation
    if (lowerAddr.includes('adajan')) return { top: '25%', left: '45%' };
    if (lowerAddr.includes('vesu')) return { top: '45%', left: '80%' };
    if (lowerAddr.includes('city light') || lowerAddr.includes('citylight')) return { top: '65%', left: '45%' };
    if (lowerAddr.includes('industrial')) return { top: '15%', left: '15%' };
    if (lowerAddr.includes('parle point')) return { top: '55%', left: '35%' };
    if (lowerAddr.includes('dumas')) return { top: '80%', left: '20%' };
    
    // Deterministic fallback for dynamic addresses
    let hash = 0;
    for (let i = 0; i < lowerAddr.length; i++) {
      hash = lowerAddr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const top = 20 + (Math.abs(hash) % 60); // Between 20% and 80%
    const left = 20 + (Math.abs(hash >> 2) % 60); // Between 20% and 80%
    
    return { top: `${top}%`, left: `${left}%` };
  };

  const pos = getMarkerPosition(address);

  return (
    <div className="w-full h-full bg-[#020817] flex items-center justify-center relative overflow-hidden rounded-md border border-slate-800">
      {/* Enhanced map visualization for Surat, Gujarat, India */}
      <div className="absolute inset-0 bg-[#0a101f]">
        {/* Grid Floor */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Major highways - Cyber Theme */}
        <div className="absolute h-[1px] w-full top-1/4 left-0 bg-[#f97316]/20 transform -rotate-1"></div>
        <div className="absolute h-[1px] w-full top-1/2 left-0 bg-slate-800/50"></div>
        <div className="absolute w-[1px] h-full top-0 left-1/3 bg-[#f97316]/10 transform rotate-2"></div>
        <div className="absolute w-[1px] h-full top-0 right-1/4 bg-slate-800/50"></div>
        
        {/* Tapi River - Stylized */}
        <div className="absolute top-[35%] w-full h-12 bg-blue-500/5 -rotate-2">
            <div className="w-full h-[1px] bg-blue-500/10 absolute top-0"></div>
            <div className="w-full h-[1px] bg-blue-500/10 absolute bottom-0"></div>
        </div>
        
        {/* District nodes */}
        <div className="absolute top-[10%] left-[10%] w-24 h-24 bg-slate-900/40 border border-slate-800/50 rounded-lg"></div>
        <div className="absolute top-[60%] left-[40%] w-32 h-20 bg-slate-900/40 border border-slate-800/50 rounded-lg"></div>
        <div className="absolute top-[40%] right-[15%] w-28 h-28 bg-slate-900/40 border border-slate-800/50 rounded-lg"></div>
      </div>
      
      {/* Pin location with dynamic positioning */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-in-out"
        style={{ top: pos.top, left: pos.left }}
      >
        <div className="relative group">
          {/* Target Ring */}
          <div className="absolute -inset-8 border border-dashed border-[#f97316]/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          
          {/* Pulse Glow */}
          <div className="absolute -inset-4 bg-orange-500/20 rounded-full animate-pulse blur-xl"></div>
          
          <div className="relative flex flex-col items-center">
            <div className="bg-[#f97316] p-1.5 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] border border-white/20">
               <MapPin size={18} className="text-white fill-white/10" />
            </div>
            
            {/* Floating label for the marker */}
            <div className="mt-2 px-2 py-1 bg-black/80 border border-slate-800 rounded text-[9px] font-bold text-white uppercase tracking-tighter whitespace-nowrap shadow-xl">
               Target Node
            </div>
          </div>
        </div>
      </div>
      
      {/* Address telemetry label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/50 max-w-[80%]">
        <Compass className="w-3 h-3 text-[#f97316] animate-spin-slow" />
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest truncate">
            {address}
        </span>
      </div>
    </div>
  );
};

export default MapView;
