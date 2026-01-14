import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github, Send, Star } from 'lucide-react';
import { LogoIcon } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
    const { toast } = useToast();
    const [reviewForm, setReviewForm] = useState({
        name: '',
        email: '',
        message: '',
        rating: 0
    });

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: reviewForm.name,
                    email: reviewForm.email,
                    message: reviewForm.message,
                    rating: reviewForm.rating || 5
                }),
            });

            if (response.ok) {
                toast({
                    title: "Review Submitted!",
                    description: "Thank you for your feedback. It will be displayed shortly.",
                });
                setReviewForm({ name: '', email: '', message: '', rating: 0 });
            } else {
                throw new Error('Failed to submit review');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "Something went wrong. Please try again later.",
            });
        }
    };

    const footerLinks = {
        product: [
            { name: 'Features', href: '/features' },
            { name: 'How it Works', href: '/features#how-it-works' },
            { name: 'FAQ', href: '/about#faq' },
        ],
        company: [
            { name: 'About FuelMate', href: '/about' },
            { name: 'Contact Us', href: '/contact' }
        ]
    };

    return (
        <footer className="bg-slate-950 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
                    {/* Brand Column - 4 cols */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <LogoIcon className="w-9 h-9 text-orange-500" />
                            <span className="text-[20px] font-bold text-white">FuelMate</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6 max-w-sm">
                            Revolutionizing fuel delivery with convenience, quality, and reliability.
                            Your partner in efficient energy management.
                        </p>
                    </div>

                    {/* Links Columns - 4 cols (2 each) */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-orange-500 transition-colors duration-200 text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-orange-500 transition-colors duration-200 text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Review Section - 4 cols */}
                    <div className="lg:col-span-4" id="leave-review">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            Leave a Review <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                        </h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Your Name"
                                    className="bg-slate-950 border-slate-700 text-white placeholder:text-gray-500 h-10 text-sm"
                                    value={reviewForm.name}
                                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    type="email"
                                    placeholder="Your Email Address"
                                    className="bg-slate-950 border-slate-700 text-white placeholder:text-gray-500 h-10 text-sm"
                                    value={reviewForm.email}
                                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Star Rating Input */}
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-sm text-gray-400">Rating:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-5 h-5 ${(reviewForm.rating) >= star
                                                    ? 'text-orange-500 fill-orange-500'
                                                    : 'text-slate-600'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Textarea
                                    placeholder="Share your experience..."
                                    className="bg-slate-950 border-slate-700 text-white placeholder:text-gray-500 min-h-[80px] text-sm resize-none"
                                    value={reviewForm.message}
                                    onChange={(e) => setReviewForm({ ...reviewForm, message: e.target.value })}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                size="sm"
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium group"
                            >
                                Submit Review <Send className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} FuelMate. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
