import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Truck, Car, ArrowRight, ShieldCheck, Clock, Star, Instagram, Twitter, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: "Send Packages",
      description: "Any size, anywhere. Reliable package delivery at your fingertips.",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      image: "/landing_package_delivery.png"
    },
    {
      icon: Truck,
      title: "Pickup & Dropoff",
      description: "Need something fetched? We've got it handled for you.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      image: "/landing_errands.png"
    },
    {
      icon: Car,
      title: "Car Services",
      description: "Mobile washes, detailing, and essential auto services.",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      image: "/landing_car_wash.png"
    },
  ];

  const testimonials = [
    {
      quote: "Get2U has completely transformed my weekends. I just hand off my errands and relax. The agents are professional and extremely fast.",
      name: "Sarah Jenkins",
      role: "Busy Parent",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
      quote: "As a small business owner, having a reliable courier on speed dial is game-changing. The mobile app makes tracking so easy.",
      name: "Michael Chen",
      role: "Boutique Owner",
      avatar: "https://i.pravatar.cc/150?u=michael"
    },
    {
      quote: "I ordered a premium car wash while I was at the office. Came out to a spotless car. Truly an elite service experience.",
      name: "David Ross",
      role: "Sales Director",
      avatar: "https://i.pravatar.cc/150?u=david"
    }
  ];

  const faqs = [
    {
      q: "How are agents vetted?",
      a: "Every agent undergoes a rigorous multi-step vetting process, including identity verification, background checks, and vehicle inspections to ensure maximum safety and reliability."
    },
    {
      q: "How do you handle pricing?",
      a: "Our pricing is fully transparent. You'll see the base fee before requesting, and you can add an optional tip. There are never any hidden surges."
    },
    {
      q: "Are my packages insured?",
      a: "Yes! All active deliveries are covered under our commercial liability policy during transit for your absolute peace of mind."
    },
    {
      q: "Can I schedule an errand in advance?",
      a: "Currently, Get2U focuses on high-speed on-demand service. Placed requests are immediately broadcasted to available nearby agents."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col font-bricolage bg-background selection:bg-primary/20">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 glass-panel border-b border-border/40 shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 px-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1 items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-xl">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Get2u
            </span>
          </div>
          <div className="flex flex-1 justify-end items-center gap-4">
            <Button variant="ghost" className="font-semibold" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button
              className="rounded-full px-6 font-semibold shadow-lg shadow-primary/30"
              onClick={() => navigate("/login")}
            >
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-32 pb-16">
        {/* Editorial Hero Section */}
        <section className="relative px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-8 pb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Launching in your city
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-foreground mb-6 leading-[1.1]">
                Time is luxury. <br />
                <span className="text-gradient">We fetch it back.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed font-medium">
                Delegate your physical tasks to our fleet of vetted concierges. From secure package delivery to premium driveway car detailing.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button size="lg" className="h-14 w-full sm:w-auto px-8 rounded-full text-lg shadow-xl shadow-primary/25" onClick={() => navigate("/login")}>
                  Request Service <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 text-sm text-foreground font-semibold mt-4 sm:mt-0">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-background" src="https://i.pravatar.cc/150?u=1" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-background" src="https://i.pravatar.cc/150?u=2" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-background" src="https://i.pravatar.cc/150?u=3" alt="User" />
                  </div>
                  <span>Join 2,000+ members</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Image Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block h-[600px] w-full"
            >
              {/* Main large image */}
              <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-3xl overflow-hidden shadow-2xl border-4 border-background z-10 animate-float" style={{ animationDelay: '0s' }}>
                <img src="/landing_package_delivery.png" alt="Package Delivery" className="w-full h-full object-cover" />
              </div>
              {/* Secondary overlapping images */}
              <div className="absolute bottom-10 left-0 w-1/2 h-1/2 rounded-3xl overflow-hidden shadow-2xl border-4 border-background z-20 animate-float" style={{ animationDelay: '1s' }}>
                <img src="/landing_car_wash.png" alt="Car Detail" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 right-12 w-2/5 h-2/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-background z-30 animate-float" style={{ animationDelay: '2s' }}>
                <img src="/landing_errands.png" alt="Errands" className="w-full h-full object-cover" />
              </div>
              
              {/* Background styling blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl -z-10 rounded-full" />
            </motion.div>
          </div>
        </section>

        {/* Value Props & Features */}
        <section className="bg-secondary/30 py-24 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center md:text-left mb-16 max-w-2xl">
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">Elite Services, <span className="text-primary line-through decoration-primary/50">zero friction</span>.</h2>
              <p className="text-lg text-muted-foreground">Every agent is vetted and tracked in real-time. Choose your service category and offload your day.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative bg-card rounded-3xl border border-border/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="h-48 w-full overflow-hidden">
                    <img src={feature.image} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-8">
                    <div className={`inline-flex p-3 rounded-2xl ${feature.bg} ${feature.color} mb-6`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Trusted by the best.</h2>
            <p className="text-lg text-muted-foreground">Don't just take our word for it. See what our community is saying.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-card glass-panel p-8 rounded-3xl border border-border/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-6 text-primary">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <p className="text-lg leading-relaxed font-medium mb-8">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-border" />
                  <div>
                    <h4 className="font-bold text-foreground">{t.name}</h4>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-primary text-primary-foreground py-24">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold tracking-tight mb-12 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-4 text-left">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="bg-primary-foreground/10 border-none rounded-2xl px-6 py-2">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-primary-foreground/80 text-base leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12 border-b border-zinc-800 pb-12">
            <div className="col-span-2 md:col-span-1 border-r border-zinc-800/0 md:border-zinc-800 pr-8">
               <div className="flex items-center gap-2 text-white mb-6">
                 <Truck className="h-6 w-6 text-primary" />
                 <span className="text-2xl font-extrabold tracking-tight">Get2u</span>
               </div>
               <p className="text-sm leading-loose">Premium concierge and errand services on-demand. Give us the task, we'll fetch the results.</p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Socials</h4>
              <div className="flex gap-4">
                <a href="#" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>© {new Date().getFullYear()} Get2u LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
