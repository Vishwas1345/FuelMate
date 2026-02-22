import React from 'react';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { User } from '@/services/api';
import { Button } from './ui/button';

interface StationContactProps {
    station: User;
}

const StationContact: React.FC<StationContactProps> = ({ station }) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.pumpLocation?.coordinates?.lat},${station.pumpLocation?.coordinates?.lng}`;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Contact Column */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Official Contact Points</h3>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm group">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Support Line</p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-slate-950 flex items-center justify-center border border-slate-800 text-orange-500">
                                <Phone className="w-5 h-5" />
                            </div>
                            <a href={`tel:${station.businessPhone}`} className="text-xl font-mono font-bold text-white hover:text-orange-500 transition-colors">
                                {station.businessPhone || station.phone || "UNAVAILABLE"}
                            </a>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm group">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Corporate Email</p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-slate-950 flex items-center justify-center border border-slate-800 text-orange-500">
                                <Mail className="w-5 h-5" />
                            </div>
                            <a href={`mailto:${station.email}`} className="text-lg font-bold text-white hover:text-orange-500 transition-colors truncate">
                                {station.email || "support@fuelmate.com"}
                            </a>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Registered Location</p>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded bg-slate-950 flex items-center justify-center border border-slate-800 text-orange-500 mt-1 flex-shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-white font-bold leading-relaxed">
                                    {station.pumpLocation?.addressLine}<br />
                                    {station.pumpLocation?.city}, {station.pumpLocation?.state}<br />
                                    IND - {station.pumpLocation?.zipCode}
                                </p>
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-orange-500 hover:text-orange-400 font-bold text-xs uppercase tracking-widest mt-4 gap-2"
                                    onClick={() => window.open(googleMapsUrl, '_blank')}
                                >
                                    Launch Satellite Maps <ExternalLink className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-lg p-6 flex items-center gap-4">
                        <ShieldCheck className="w-8 h-8 text-orange-500/50" />
                        <p className="text-xs text-slate-400 font-medium">This partner is vetted by our compliance team for quality and safety standards.</p>
                    </div>
                </div>

                {/* Satellite View Column */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-full min-h-[500px] relative shadow-2xl">
                        <div className="absolute top-6 left-6 z-10">
                            <div className="bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded border border-slate-800 flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                Precision Tracking Active
                            </div>
                        </div>
                        <iframe
                            title="Station Location"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%) opacity(0.8)' }}
                            src={`https://maps.google.com/maps?q=${station.pumpLocation?.coordinates?.lat},${station.pumpLocation?.coordinates?.lng}&z=16&output=embed`}
                            allowFullScreen
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StationContact;
