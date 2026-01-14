import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, User, LogOut, Gift, Copy } from 'lucide-react';
import { LogoIcon } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import BoardSwitcher from '@/components/BoardSwitcher';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const [showReferCode, setShowReferCode] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyReferCode = () => {
    const referCode = `FUELMATE-${user?.id?.slice(0, 6).toUpperCase()}`;
    navigator.clipboard.writeText(referCode);
    toast({
      title: "Referral code copied!",
      description: "Share this code with your friends to earn rewards.",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950 border-b border-slate-800 shadow-md">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <LogoIcon className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold text-white">FuelMate</span>
          </Link>

          <BoardSwitcher />
        </div>

        <nav className="flex items-center gap-2 md:gap-4">
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <Settings className="w-5 h-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-slate-700 text-white">
                    {getInitials(user?.name || '')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-white" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="w-[200px] truncate text-sm text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  setShowReferCode(!showReferCode);
                }}
              >
                <Gift className="mr-2 h-4 w-4" />
                <span>Refer & Earn</span>
              </DropdownMenuItem>
              {showReferCode && (
                <div className="p-2 bg-slate-800 m-2 rounded-md">
                  <p className="text-sm text-gray-400 mb-2">Your Referral Code:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-orange-400 font-mono text-sm">
                      FUELMATE-{user?.id?.slice(0, 6).toUpperCase()}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={handleCopyReferCode}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                className="cursor-pointer text-red-400 hover:text-red-300"
                onSelect={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};

export default Header;
