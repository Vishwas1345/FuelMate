import React from 'react';
import { Info, History, Calendar, Quote, Briefcase, Award } from 'lucide-react';
import { User } from '@/services/api';

interface StationAboutProps {
    station: User;
}

const StationAbout: React.FC<StationAboutProps> = ({ station }) => {
    const hasDetails = station.about || station.history || station.startingYear;

    if (!hasDetails) {
        return (
            <div className="py-20 text-center bg-slate-900 border border-dashed border-slate-800 rounded-lg max-w-4xl mx-auto shadow-sm">
                <Info className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg">Detailed Profiles Pending</h3>
                <p className="text-slate-500 text-sm mt-2">Station management has not yet published their corporate history or mission statement.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Meta Info Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-950 rounded flex items-center justify-center border border-slate-800">
                        <Calendar className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">In Operation Since</p>
                        <p className="text-white font-semibold text-xl">{station.startingYear || "N/A"}</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-950 rounded flex items-center justify-center border border-slate-800">
                        <Briefcase className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Business Type</p>
                        <p className="text-white font-semibold text-xl">Fuel Partner</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-950 rounded flex items-center justify-center border border-slate-800">
                        <Award className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Verification</p>
                        <p className="text-green-500 font-semibold text-xl">CERTIFIED</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* About Section */}
                {station.about && (
                    <div className="p-10 rounded-lg bg-slate-900 border border-slate-800 shadow-sm">
                        <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
                            <Info className="w-4 h-4 text-orange-500" /> Organizational Overview
                        </h3>
                        <p className="text-slate-400 leading-8 text-lg whitespace-pre-wrap font-medium">
                            {station.about}
                        </p>
                    </div>
                )}

                {/* History Section */}
                {station.history && (
                    <div className="p-10 rounded-lg bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[60px] pointer-events-none" />
                        <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
                            <History className="w-4 h-4 text-orange-500" /> Operational Legacy
                        </h3>
                        <div className="border-l-2 border-slate-800 pl-8 ml-2">
                            <p className="text-slate-500 italic leading-8 text-lg whitespace-pre-wrap font-medium">
                                "{station.history}"
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StationAbout;
