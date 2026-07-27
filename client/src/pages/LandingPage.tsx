import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ShoppingCart, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { appStructuredData, renderJsonLd } from '../utils/seo';

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div className="bg-white border-3 border-primary nb-shadow p-6 font-mono hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
    <div className="w-12 h-12 bg-primary text-white flex items-center justify-center mb-4 border-2 border-primary">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-black text-primary uppercase mb-2">{title}</h3>
    <p className="text-slate-500 text-sm">{description}</p>
  </div>
);

const LandingPage = () => {
  usePageMeta({
    title: 'Urban Bistro - Food Ordering Platform',
    description: 'The definitive food ordering experience. Browse curated restaurants, order online, and manage your business with Urban Bistro.',
  });

  useEffect(() => {
    renderJsonLd(appStructuredData());
  }, []);

  return (
    <main className="min-h-screen bg-accent font-mono">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left z-10">
            <h1 className="text-6xl md:text-8xl font-black text-primary uppercase tracking-tighter leading-none mb-6">
              Urban<br />
              <span className="text-slate-400">Bistro</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium">
              The definitive food ordering experience. Brutalist design, 
              seamless performance, and absolute precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/restaurants" 
                className="nb-button bg-primary text-white px-8 py-4 text-lg uppercase font-black flex items-center justify-center gap-2"
              >
                Explore Eateries <ArrowRight size={20} />
              </Link>
              <Link 
                to="/register" 
                className="nb-button bg-white text-primary px-8 py-4 text-lg uppercase font-black flex items-center justify-center gap-2"
              >
                Join the Club
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative bg-white border-3 border-primary nb-shadow p-4 rotate-3 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" 
                alt="Gourmet steak with roasted vegetables and herbs" 
                className="w-full h-auto border-2 border-primary"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-4 border-2 border-primary font-black uppercase text-sm nb-shadow-sm rotate-[-6deg]">
                Fastest Delivery in Town
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white border-y-3 border-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-primary uppercase font-mono mb-4">System Features</h2>
            <div className="h-2 w-24 bg-primary mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Utensils} 
              title="Curated Menus" 
              description="Access a hand-picked selection of the city's most unique urban eateries." 
            />
            <FeatureCard 
              icon={ShoppingCart} 
              title="Smart Cart" 
              description="Intuitive local state management with single-restaurant constraints." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Secure Access" 
              description="Enterprise-grade JWT authentication and role-based access control." 
            />
            <FeatureCard 
              icon={Zap} 
              title="Instant Sync" 
              description="Real-time order status updates powered by TanStack Query." 
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto bg-primary text-white border-3 border-primary nb-shadow p-12">
          <h2 className="text-4xl font-black uppercase mb-6">Ready to start?</h2>
          <p className="text-primary-100 mb-10 opacity-80">
            Join thousands of foodies and restaurant owners building the future of urban dining.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-white text-primary px-8 py-3 font-black uppercase border-2 border-white hover:bg-transparent hover:text-white transition-all"
            >
              Login Now
            </Link>
            <Link 
              to="/register" 
              className="bg-transparent text-white px-8 py-3 font-black uppercase border-2 border-white hover:bg-white hover:text-primary transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
