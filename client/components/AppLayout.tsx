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
                <main className="flex-1 px-8 py-8 bg-[#020817]">
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-3 border-t border-slate-800/50 bg-[#020817]">
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wider text-center">
                        FuelMate © 2026 • Secure & Encrypted
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AppLayout;
