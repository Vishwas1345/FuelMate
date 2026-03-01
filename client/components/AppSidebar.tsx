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
                { name: 'Account', icon: User, path: '/profile' },
                { name: 'Settings', icon: Settings, path: '/settings' },
            ];
        }
        return [
            { name: 'Order Fuel', icon: Fuel, path: '/customer' },
            { name: 'Orders Dashboard', icon: LayoutDashboard, path: '/orders-dashboard' },
            { name: 'Account', icon: User, path: '/profile' },
            { name: 'Settings', icon: Settings, path: '/settings' },
        ];
    };

    const menuItems = getMenuItems();
    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#020817] border-r border-slate-800/50 flex flex-col z-50">
            {/* Logo Section */}
            <div className="px-6 py-6 border-b border-slate-800/50">
                <Link to="/" className="flex items-center gap-3">
                    <LogoIcon className="w-5 h-5 text-orange-500" />
                    <span className="text-lg font-semibold text-white tracking-tight">FuelMate</span>
                </Link>
            </div>

            {/* Navigation section */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Navigation</p>
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group relative ${isActive(item.path)
                            ? 'bg-orange-500 text-white rounded-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-md'
                            }`}
                    >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{item.name}</span>
                        {isActive(item.path) && (
                            <ChevronRight className="ml-auto w-4 h-4" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Profile Section */}
            <div className="mt-auto p-4 border-t border-slate-800/50 space-y-3">
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-md p-3 flex items-center gap-3">
                    <Avatar className="h-9 w-9 ring-1 ring-slate-700">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-orange-500 text-white font-medium text-xs">
                            {user?.name?.[0].toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'User Account'}</p>
                        <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'Customer'}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>

                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800/30 transition-all rounded-md text-sm font-medium group w-full"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AppSidebar;
