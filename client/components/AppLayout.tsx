import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';

const AppLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-[#020817] overflow-hidden">
            {/* Sidebar - Fixed width */}
            <AppSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-64 min-h-screen">
                {/* Main Content Scrollable */}
                <main className="flex-1 px-8 py-10 bg-[#020817]">
                    <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                        <Outlet />
                    </div>
                </main>

                {/* Footer info subtler as in reference */}
                <footer className="py-4 border-t border-slate-900 bg-[#020817]">
                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em] text-center">
                        FuelMate Operations Dashboard © 2026 • Secure & Encrypted
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AppLayout;
