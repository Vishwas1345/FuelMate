import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LogoIcon } from '@/components/Logo';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Features', href: '/features' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <LogoIcon className="w-7 h-7 text-orange-500" />
                        <span className="text-xl font-bold text-white">FuelMate</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`transition-colors duration-200 font-medium ${isActive(link.href)
                                    ? 'text-orange-500'
                                    : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link to="/auth">
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-white p-2"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`block transition-colors duration-200 font-medium py-2 ${isActive(link.href)
                                    ? 'text-orange-500'
                                    : 'text-gray-300 hover:text-white'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
