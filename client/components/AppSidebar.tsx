import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Fuel,
    LayoutDashboard,
    User,
    Settings,
    LogOut,
    ChevronRight,
    Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LogoIcon } from './Logo';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const AppSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const getMenuItems = () => {
        if (user?.role === 'station') {
            return [
                { name: 'Station Dashboard', icon: LayoutDashboard, path: '/station' },
                { name: 'Order Management', icon: Fuel, path: '/station' },
                { name: 'Account access', icon: User, path: '/profile' },
                { name: 'Settings', icon: Settings, path: '/settings' },
            ];
        }
        return [
            { name: 'Order fuel', icon: Fuel, path: '/customer' },
            { name: 'Your ordering dashboard', icon: LayoutDashboard, path: '/orders-dashboard' },
            { name: 'Account access', icon: User, path: '/profile' },
            { name: 'Settings', icon: Settings, path: '/settings' },
        ];
    };

    const menuItems = getMenuItems();
    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#020817] border-r border-slate-800 flex flex-col z-50">
            {/* Logo Section */}
            <div className="p-8">
                <Link to="/" className="flex items-center gap-3">
                    <LogoIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xl font-bold text-white tracking-tight">FuelMate</span>
                </Link>
            </div>

            {/* Navigation section */}
            <nav className="flex-1 px-2 space-y-1">
                <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-3 px-6 py-2 transition-colors duration-200 group relative ${isActive(item.path)
                            ? 'bg-[#f97316] text-white rounded-lg mx-2'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold text-sm truncate">{item.name}</span>
                        {isActive(item.path) && (
                            <ChevronRight className="ml-auto w-4 h-4" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Profile Section */}
            <div className="mt-auto p-4 space-y-4">
                <div className="bg-[#0a101f] border border-slate-800/50 rounded-xl p-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-slate-800">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-[#f97316] text-white font-bold text-sm">
                            {user?.name?.[0].toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.name || 'Partner Account'}</p>
                        <p className="text-[10px] text-slate-500 truncate uppercase tracking-tight">{user?.role || 'Service'}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                </div>

                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold group w-full"
                >
                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AppSidebar;
