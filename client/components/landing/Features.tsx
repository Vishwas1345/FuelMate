import {
    Zap,
    Shield,
    Clock,
    MapPin,
    CreditCard,
    Headphones
} from 'lucide-react';

const Features = () => {
    const features = [
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Lightning Fast Delivery',
            description: 'Get fuel delivered to your location within 30 minutes. Our efficient network ensures quick service every time.',
            gradient: 'from-orange-500 to-orange-600',
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Premium Quality Fuel',
            description: 'We source only the highest quality fuel from certified suppliers. Your vehicle deserves the best.',
            gradient: 'from-blue-500 to-blue-600',
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: '24/7 Availability',
            description: 'Need fuel at 3 AM? No problem. Our service is available round the clock, every day of the year.',
            gradient: 'from-purple-500 to-purple-600',
        },
        {
            icon: <MapPin className="w-8 h-8" />,
            title: 'Real-Time Tracking',
            description: 'Track your delivery in real-time with our advanced GPS system. Know exactly when your fuel will arrive.',
            gradient: 'from-green-500 to-green-600',
        },
        {
            icon: <CreditCard className="w-8 h-8" />,
            title: 'Secure Payments',
            description: 'Multiple payment options with bank-grade security. Pay with cards, wallets, or cash on delivery.',
            gradient: 'from-pink-500 to-pink-600',
        },
        {
            icon: <Headphones className="w-8 h-8" />,
            title: 'Dedicated Support',
            description: 'Our customer support team is always ready to help. Get assistance whenever you need it.',
            gradient: 'from-yellow-500 to-yellow-600',
        },
    ];

    return (
        <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-slate-800/[0.05] bg-[size:32px_32px]"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white">
                        Why Choose <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">FuelMate</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Experience the future of fuel delivery with our cutting-edge features designed for your convenience
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 hover:transform hover:scale-105"
                        >
                            {/* Icon */}
                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <div className="text-white">
                                    {feature.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Hover effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <p className="text-gray-400 mb-4">Ready to experience hassle-free fuel delivery?</p>
                    <a
                        href="/auth"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                        Start Your First Order
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Features;
