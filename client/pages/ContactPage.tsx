import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Contact from '@/components/landing/Contact';

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <div className="pt-16">
                <Contact />
            </div>
            <Footer />
        </div>
    );
};

export default ContactPage;
