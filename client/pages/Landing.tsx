import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import About from '@/components/landing/About';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <Hero />
            <Features />
            <About />
            <Contact />
            <Footer />
        </div>
    );
};

export default Landing;
