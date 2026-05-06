import React from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Zap, Mail, ShoppingCart, ShieldCheck, Sparkles, Globe, Activity } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-ios-blue/30 overflow-x-hidden">
      {/* Background Intelligence Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-ios-blue/10 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[90%] h-[90%] bg-ios-purple/10 rounded-full blur-[180px]"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 backdrop-blur-2xl border-b border-white/[0.05] bg-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">AutoAgent</span>
              <span className="text-[8px] font-black text-ios-blue uppercase tracking-[0.3em] mt-0.5">Intelligence Core</span>
            </div>
          </div>
          
          <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <a href="#features" className="hover:text-white transition">Capabilities</a>
            <a href="#how-it-works" className="hover:text-white transition">Architecture</a>
            <a href="#pricing" className="hover:text-white transition">Deployment</a>
          </div>

          <div className="flex gap-6 items-center">
            <button onClick={onEnter} className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition">
              Identity Verification
            </button>
            <button 
              onClick={onEnter} 
              className="px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-48 flex items-center justify-center text-center px-6">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-ios-blue mb-12 backdrop-blur-xl shadow-2xl"
          >
            <Sparkles className="w-3.5 h-3.5" /> Neural Engine v4.0 is Online
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-12"
          >
            Sovereign <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ios-blue via-ios-purple to-ios-indigo">
              Intelligence.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed"
          >
            Connect your merchant endpoint. Deploy autonomous agents to optimize inventory, recover revenue, and scale operations with zero latency.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <button onClick={onEnter} className="ios-btn-primary py-5 px-12 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-ios-blue/20 group">
              Initialize Protocol <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onEnter} className="px-12 py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
              Live Simulation
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 flex justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700"
          >
            <ShieldCheck className="w-8 h-8" />
            <Globe className="w-8 h-8" />
            <Activity className="w-8 h-8" />
            <Zap className="w-8 h-8" />
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview - iOS Style Frame */}
      <section className="px-6 py-24 bg-gradient-to-b from-transparent to-white/[0.02]">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto ios-glass !p-2 rounded-[2.5rem] border-white/10 shadow-[0_0_100px_rgba(0,122,255,0.15)] overflow-hidden"
        >
          <div className="bg-[#0c0c0c] rounded-[2.2rem] overflow-hidden aspect-video relative group">
            <img 
              src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=2000" 
              alt="Platform Preview"
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/20 cursor-pointer hover:scale-110 transition-all shadow-2xl">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 lg:py-48 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tighter">Distributed Intelligence.</h2>
            <p className="text-lg lg:text-2xl text-zinc-400 font-medium max-w-2xl mx-auto">Autonomous agents designed to operate in parallel, optimizing every vector of your enterprise.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Recovery Nexus', icon: Mail, desc: 'Synthesizes high-conversion communication sequences to reactivate abandoned payloads.', color: 'ios-blue' },
              { title: 'Inventory Core', icon: ShoppingCart, desc: 'Real-time predictive modeling of stock velocity and lifecycle management.', color: 'ios-orange' },
              { title: 'Pricing Engine', icon: Zap, desc: 'Dynamic algorithmic adjustments to capture maximum margin across all nodes.', color: 'ios-green' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="ios-card group hover:scale-[1.02] transition-all"
              >
                <div className={`w-14 h-14 rounded-[1.5rem] bg-${f.color}/10 flex items-center justify-center mb-8 border border-${f.color}/20`}>
                  <f.icon className={`w-7 h-7 text-${f.color}`} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{f.title}</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 relative overflow-hidden text-center px-6">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">Start Your Autonomous <br /> <span className="text-ios-blue">Expansion.</span></h2>
          <p className="text-lg md:text-2xl text-zinc-400 mb-12 font-medium">Join the next generation of intelligent commerce.</p>
          <button onClick={onEnter} className="ios-btn-primary py-6 px-16 text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-ios-blue/30 group">
            Get Started Now
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/50 backdrop-blur-xl px-8 text-center">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-8">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-zinc-500" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">© 2026 AutoAgent Neural Systems</span>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
