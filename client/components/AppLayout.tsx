import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

const AppLayout: React.FC = () => {
    const isMobile = useIsMobile();
    const { user } = useAuth();
    const brandHome = user?.role === 'station' ? '/station' : '/customer';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // On desktop, sidebar should always be open
    useEffect(() => {
        if (!isMobile) {
            setIsSidebarOpen(true);
        }
    }, [isMobile]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-[#020817] overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar - Responsive */}
            <AppSidebar isOpen={isMobile ? isSidebarOpen : true} onClose={closeSidebar} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
                {/* Mobile Header with Menu Button */}
                <div className="md:hidden sticky top-0 z-30 bg-[#020817] border-b border-slate-800/50 px-4 py-3 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="text-white hover:bg-slate-800/50"
                    >
                        {isSidebarOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </Button>
                    <Link
                        to={brandHome}
                        className="text-lg font-semibold text-white hover:text-orange-400 transition-colors"
                        onClick={closeSidebar}
                    >
                        FuelMate
                    </Link>
                </div>

                {/* Main Content Scrollable */}
                <main className="flex-1 px-4 md:pl-8 md:pr-8 py-6 md:py-8 bg-[#020817]">
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
