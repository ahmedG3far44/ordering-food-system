import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Utensils,
  ShoppingCart,
  ShieldCheck,
  Zap,
  ArrowRight,
  ChefHat,
  Truck,
  Star,
  Heart,
  Store,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { appStructuredData, renderJsonLd } from "../utils/seo";
import { useAuthStore } from "../store/authStore";

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function useParallax(speed = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrolled = window.innerHeight - rect.top;
    if (scrolled > 0 && rect.top < window.innerHeight) {
      setOffset(scrolled * speed);
    }
  }, [speed]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  return { ref, offset };
}

const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: any) => (
  <Reveal delay={delay}>
    <div className="bg-white border-3 border-primary nb-shadow p-6 font-mono hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
      <div className="w-12 h-12 bg-primary text-white flex items-center justify-center mb-4 border-2 border-primary">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-black text-primary uppercase mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">{description}</p>
    </div>
  </Reveal>
);

const StatCard = ({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) => (
  <Reveal delay={delay}>
    <div className="text-center border-3 border-white/30 bg-white/10 nb-shadow-sm p-6 backdrop-blur">
      <p className="text-4xl md:text-5xl font-black text-white">{value}</p>
      <p className="text-sm font-bold text-white/70 uppercase mt-1 tracking-wider">{label}</p>
    </div>
  </Reveal>
);

const StepCard = ({ number, icon: Icon, title, description, delay = 0 }: any) => (
  <Reveal delay={delay}>
    <div className="relative bg-white border-3 border-primary nb-shadow p-8 text-center pt-16">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-primary text-white text-xl font-black flex items-center justify-center border-2 border-primary nb-shadow-sm">
        {number}
      </div>
      <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-black text-primary uppercase mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  </Reveal>
);

const CategoryCard = ({ icon: Icon, name, description, delay = 0 }: any) => (
  <Reveal delay={delay}>
    <Link
      to="/restaurants"
      className="block bg-white border-3 border-primary nb-shadow-sm p-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-center group"
    >
      <div className="w-16 h-16 bg-primary/5 text-primary flex items-center justify-center mx-auto mb-4 border-2 border-primary group-hover:bg-primary group-hover:text-white transition-all">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-black text-primary uppercase">{name}</h3>
      <p className="text-slate-500 text-xs mt-1 font-bold">{description}</p>
    </Link>
  </Reveal>
);

const TestimonialCard = ({ quote, author, role, delay = 0 }: any) => (
  <Reveal delay={delay}>
    <div className="bg-white/10 border-3 border-white/20 nb-shadow-sm p-8 backdrop-blur">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className="fill-white text-white" />
        ))}
      </div>
      <p className="text-white/85 mb-6 italic leading-relaxed text-sm">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3 pt-4 border-t-2 border-white/10">
        <div className="w-10 h-10 bg-white text-primary font-black flex items-center justify-center text-sm border-2 border-white">
          {author.split(" ").map((n: string) => n[0]).join("")}
        </div>
        <div>
          <p className="font-black text-white text-sm uppercase">{author}</p>
          <p className="text-xs text-white/60 font-bold">{role}</p>
        </div>
      </div>
    </div>
  </Reveal>
);

const LandingPage = () => {
  const { user } = useAuthStore();
  const heroParallax = useParallax(0.08);

  usePageMeta({
    title: "Urban Bistro - Food Ordering Platform",
    description:
      "The definitive food ordering experience. Browse curated restaurants, order food online, and manage your business with Urban Bistro. Fast delivery, brutalist design, seamless performance.",
    keywords: "food ordering platform, online food delivery, restaurant management system, urban dining, order food online, food delivery app, bistro platform",
  });

  useEffect(() => {
    renderJsonLd(appStructuredData());
  }, []);

  return (
    <main className="min-h-screen bg-accent font-mono overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Parallax background watermark */}
        <div
          ref={heroParallax.ref}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          <span
            className="text-[30vw] font-black text-primary/[0.03] uppercase tracking-tighter leading-none whitespace-nowrap parallax-slow"
            style={{ transform: `translateY(${heroParallax.offset}px)` }}
          >
            Urban Bistro
          </span>
        </div>

        {/* Parallax decorative elements */}
        <div
          className="absolute top-0 left-0 w-40 h-40 border-8 border-primary -translate-x-1/3 -translate-y-1/3 hidden lg:block parallax-slow"
          style={{ transform: `translate(calc(-33.33% + ${heroParallax.offset * 0.3}px), calc(-33.33% - ${heroParallax.offset * 0.2}px))` }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 bg-primary/[0.02] hidden lg:block parallax-slow"
          style={{ transform: `translate(${heroParallax.offset * -0.15}px, ${heroParallax.offset * 0.1}px)` }}
        />
        <div
          className="absolute top-1/3 right-12 w-6 h-6 bg-primary rotate-45 hidden lg:block parallax-slow"
          style={{ transform: `rotate(45deg) translateY(${heroParallax.offset * -0.4}px)` }}
        />

        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left content — 7 columns */}
            <div className="lg:col-span-7 relative z-10">
              {/* Magazine-style rule with kicker */}
              <div className="flex items-center gap-4 mb-10 max-w-xl">
                <div className="h-px flex-1 bg-primary/20" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] flex-shrink-0">
                  The Definitive Experience
                </span>
                <div className="h-px flex-1 bg-primary/20" />
              </div>

              {/* Headline */}
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-primary uppercase tracking-tighter leading-[0.82] mb-2">
                Urban
              </h1>
              <div className="flex items-center gap-5 mb-8">
                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-primary/15 uppercase tracking-tighter leading-none">
                  Bistro
                </span>
                <div className="w-12 h-12 border-[3px] border-primary rotate-45 flex-shrink-0 hidden sm:block" />
              </div>

              <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-lg mb-10">
                The definitive food ordering experience. Brutalist design,
                seamless performance, and absolute precision.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/restaurants"
                  className="nb-button bg-primary text-white px-10 py-5 text-lg uppercase font-black flex items-center justify-center gap-3 group"
                >
                  Explore Eateries
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="nb-button bg-white text-primary px-10 py-5 text-lg uppercase font-black flex items-center justify-center gap-2 border-3 border-primary"
                >
                  Join the Club
                </Link>
              </div>

              {/* Social proof bar */}
              <div className="flex items-center gap-6 md:gap-10 mt-12 pt-8 border-t-2 border-slate-200 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 nb-shadow-sm"
                        style={{
                          backgroundImage: i === 0
                            ? 'url(https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80)'
                            : i === 1
                            ? 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&q=80)'
                            : i === 2
                            ? 'url(https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&q=80)'
                            : 'url(https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&q=80)',
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-500">2,500+ daily</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                  <Star size={16} className="fill-primary text-primary" />
                  <span>4.9 rating</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span>30 min avg</span>
                </div>
              </div>
            </div>

            {/* Right image — 5 columns */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/[0.04] border-4 border-primary/20 hidden lg:block" />
              <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-primary/[0.03] rounded-full hidden lg:block" />

              <div className="relative bg-white border-4 border-primary nb-shadow p-3 md:p-4 -rotate-1 hover:rotate-0 transition-all duration-700">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
                  alt="Gourmet steak with roasted vegetables and herbs"
                  className="w-full h-auto border-2 border-primary"
                />
                <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 bg-white border-3 border-primary nb-shadow-sm rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="px-3 py-2 md:px-4 md:py-3 text-center">
                    <Truck size={18} className="text-primary mx-auto mb-0.5" />
                    <p className="text-[7px] md:text-[8px] font-black text-primary uppercase leading-tight">Fastest</p>
                    <p className="text-[7px] md:text-[8px] font-black text-primary uppercase leading-tight">Delivery</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 border-2 border-primary text-[9px] md:text-[10px] font-black uppercase nb-shadow-sm hidden lg:block">
                Urban dining curated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 px-4 bg-primary border-y-3 border-primary">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard value="500+" label="Restaurants" delay={0} />
          <StatCard value="50K+" label="Meals Delivered" delay={100} />
          <StatCard value="25K+" label="Happy Customers" delay={200} />
          <StatCard value="30min" label="Avg. Delivery" delay={300} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <div className="inline-block bg-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-4 nb-shadow-sm">
                Simple Process
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-primary uppercase mb-4">How It Works</h2>
              <div className="h-2 w-24 bg-primary mx-auto" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <StepCard number="01" icon={Utensils} title="Choose Restaurant" description="Browse our curated selection of the finest urban eateries and pick your craving." delay={0} />
            <StepCard number="02" icon={ShoppingCart} title="Place Your Order" description="Select from hand-crafted menus, customize your meal, and add to cart." delay={150} />
            <StepCard number="03" icon={Truck} title="Fast Delivery" description="Track your order in real-time as it's prepared and delivered to your door." delay={300} />
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-24 px-4 bg-accent border-y-3 border-primary">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-block bg-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-4 nb-shadow-sm">
                Browse by Category
              </div>
              <h2 className="text-4xl font-black text-primary uppercase mb-4">Popular Categories</h2>
              <div className="h-2 w-24 bg-primary mx-auto" />
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CategoryCard icon={ChefHat} name="Italian" description="Pasta, pizza & more" delay={0} />
            <CategoryCard icon={Utensils} name="Japanese" description="Sushi, ramen & bowls" delay={100} />
            <CategoryCard icon={Heart} name="Healthy" description="Salads & bowls" delay={200} />
            <CategoryCard icon={Zap} name="Fast Food" description="Burgers, fries & more" delay={300} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-block bg-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-4 nb-shadow-sm">
                Why Choose Us
              </div>
              <h2 className="text-4xl font-black text-primary uppercase mb-4">System Features</h2>
              <div className="h-2 w-24 bg-primary mx-auto" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={Utensils} title="Curated Menus" description="Access a hand-picked selection of the city's most unique urban eateries." delay={0} />
            <FeatureCard icon={ShoppingCart} title="Smart Cart" description="Intuitive local state management with single-restaurant constraints." delay={100} />
            <FeatureCard icon={ShieldCheck} title="Secure Access" description="Enterprise-grade JWT authentication and role-based access control." delay={200} />
            <FeatureCard icon={Zap} title="Instant Sync" description="Real-time order status updates powered by TanStack Query." delay={300} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-primary">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-block bg-white text-primary text-xs font-black uppercase tracking-widest px-4 py-2 mb-4 nb-shadow-sm">
                Testimonials
              </div>
              <h2 className="text-4xl font-black text-white uppercase mb-4">What Our Users Say</h2>
              <div className="h-2 w-24 bg-white mx-auto" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard quote="Urban Bistro transformed how I eat. The curated selection means I never settle for mediocre food." author="Sarah Chen" role="Food Enthusiast" delay={0} />
            <TestimonialCard quote="As a restaurant owner, the platform gave me tools to reach more customers effortlessly." author="Marcus Johnson" role="Restaurant Owner" delay={150} />
            <TestimonialCard quote="The delivery speed is incredible. I order and it is at my door before I know it." author="Emily Rodriguez" role="Regular Customer" delay={300} />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 bg-white text-center">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="mx-auto bg-primary text-white border-3 border-primary nb-shadow p-12 md:p-16">
              <div className="inline-block bg-white text-primary text-xs font-black uppercase tracking-widest px-4 py-2 mb-6 nb-shadow-sm">
                Get Started Today
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase mb-6">Ready to start?</h2>
              <p className="text-white/80 mb-10 text-lg">
                Join thousands of foodies and restaurant owners building the future of urban dining.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  user.role === "CUSTOMER" ? (
                    <Link
                      to="/restaurants"
                      className="bg-white text-primary px-8 py-4 font-black uppercase border-2 border-white hover:bg-transparent hover:text-white transition-all"
                    >
                      View Restaurants
                    </Link>
                  ) : (
                    <Link
                      to="/owner/dashboard"
                      className="bg-white text-primary px-8 py-4 font-black uppercase border-2 border-white hover:bg-transparent hover:text-white transition-all"
                    >
                      View Dashboard
                    </Link>
                  )
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="bg-white text-primary px-8 py-4 font-black uppercase border-2 border-white hover:bg-transparent hover:text-white transition-all"
                    >
                      Login Now
                    </Link>
                    <Link
                      to="/register"
                      className="bg-transparent text-white px-8 py-4 font-black uppercase border-2 border-white hover:bg-white hover:text-primary transition-all"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white border-t-3 border-primary">
        <div className="max-w-7xl mx-auto py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Store size={24} />
                <span className="text-2xl font-black text-white uppercase tracking-tighter">
                  Urban<span className="text-white/50">Bistro</span>
                </span>
              </div>
              <p className="text-white/60 text-sm max-w-md leading-relaxed font-medium">
                The definitive food ordering platform. Brutalist design,
                seamless performance, and absolute precision in every meal delivered.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-6 text-white/40">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/restaurants" className="text-sm text-white/70 hover:text-white transition-colors font-bold">
                    Restaurants
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors font-bold">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-white/70 hover:text-white transition-colors font-bold">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-6 text-white/40">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-white/70 font-bold">
                  <Mail size={14} />
                  support@urbanbistro.com
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70 font-bold">
                  <Phone size={14} />
                  +1 (555) 123-4567
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50 font-bold">
              &copy; {new Date().getFullYear()} Urban Bistro. All rights reserved.
            </p>
            <p className="text-sm text-white/50 font-bold flex items-center gap-2">
              Developed by{" "}
              <a
                href="https://www.linkedin.com/in/ahmedG3far44"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/70 transition-colors flex items-center gap-1 underline underline-offset-4"
              >
                <ExternalLink size={14} />
                @ahmedG3far44
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
