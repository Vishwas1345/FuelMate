import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Contact = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Message Sent Successfully! 🚀',
                    description: 'We have received your email and will get back to you shortly.',
                    variant: "default",
                });
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (error: any) {
            toast({
                title: 'Sending Failed',
                description: error.message || 'Could not send message. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const contactInfo = [
        {
            icon: <Mail className="w-6 h-6" />,
            title: 'Email Us',
            content: 'vishwastiwari1901@gmail.com',
            link: 'mailto:vishwastiwari1901@gmail.com',
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
            ),
            title: 'Whatsapp',
            content: 'Click here',
            link: 'https://wa.me/917984527433',
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: 'Visit Us',
            content: 'Near Bhagwan Mahavir University, Vesu, Surat',
            link: 'https://maps.app.goo.gl/q5ciPcZbfDuhEMmz9',
        },
    ];

    return (
        <section id="contact" className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-slate-800/[0.05] bg-[size:32px_32px]"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white">
                        Get In <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Touch</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Form with Premium Glassmorphism */}
                    <div className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/10 to-blue-600/10 rounded-3xl opacity-0 blur transition duration-500 group-hover:opacity-100"></div>
                        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 h-full transition-all duration-300">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-gray-300">Your Name</label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="bg-slate-950/50 border-slate-700 focus:border-orange-500 focus:ring-orange-500/50 transition-all text-white h-12"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="bg-slate-950/50 border-slate-700 focus:border-orange-500 focus:ring-orange-500/50 transition-all text-white h-12"
                                            placeholder="Enter email"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium text-gray-300">Subject</label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="bg-slate-950/50 border-slate-700 focus:border-orange-500 focus:ring-orange-500/50 transition-all text-white h-12"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-gray-300">Message</label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="bg-slate-950/50 border-slate-700 focus:border-orange-500 focus:ring-orange-500/50 transition-all text-white resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-6 text-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all transform hover:-translate-y-1"
                                >
                                    {isLoading ? 'Sending...' : 'Send Message'}
                                    {!isLoading && <Send className="ml-2 w-5 h-5" />}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Contact Information Cards */}
                    <div className="space-y-8">
                        {/* Info Cards */}
                        <div className="space-y-4">
                            {contactInfo.map((info, index) => (
                                <a
                                    key={index}
                                    href={info.link}
                                    className="group relative block"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                                    <div className="relative flex items-center gap-6 p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl hover:border-orange-500/40 transition-all duration-300 group-hover:translate-x-2">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                            {info.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold mb-1">{info.title}</h4>
                                            <p className="text-gray-400 group-hover:text-orange-200 transition-colors text-sm sm:text-base">{info.content}</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Business Hours & Map Placeholder */}
                        <div className="relative group hidden md:block">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl opacity-0 blur transition duration-500 group-hover:opacity-100"></div>
                            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    Business Hours
                                </h3>
                                <div className="space-y-4 text-gray-400">
                                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                        <span>Monday - Sunday</span>
                                        <span className="text-white font-mono bg-slate-800 px-3 py-1 rounded-full text-sm">24 Hours / 7 Days</span>
                                    </div>
                                    <p className="text-sm text-orange-400 mt-4 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                                        ⚡ Emergency fuel delivery is available round the clock!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
