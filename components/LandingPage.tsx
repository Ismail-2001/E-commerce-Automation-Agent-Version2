import React from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Zap, Mail, ShoppingCart, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="absolute top-0 w-full z-50 px-6 py-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">AutoAgent</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>
          <div className="flex gap-4">
            <button onClick={onEnter} className="text-sm font-semibold text-white px-4 py-2 hover:text-indigo-400 transition">
              Sign In
            </button>
            <button 
              onClick={onEnter} 
              className="text-sm font-semibold bg-white text-slate-900 px-5 py-2 rounded-lg hover:bg-slate-200 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" /> AutoAgent 2.0 is now live
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8"
          >
            Recover Lost Revenue.<br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              On Autopilot.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Connect your Shopify or WooCommerce store in 60 seconds. Our AI agents recover abandoned carts, monitor inventory, and boost your margins while you sleep.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button onClick={onEnter} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 py-4 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={onEnter} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-4 px-8 rounded-xl transition-all">
              View Live Demo
            </button>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-sm text-slate-500"
          >
            No credit card required • 14-day free trial
          </motion.p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">An entire team of AI agents.</h2>
            <p className="text-slate-400 text-lg">AutoAgent doesn&apos;t just show data. It takes action.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Recovery Agent', icon: Mail, desc: 'Automatically drafts and sends hyper-personalized emails to cart abandoners, boosting recovery by up to 22%.' },
              { title: 'Inventory AI', icon: ShoppingCart, desc: 'Predicts stockouts before they happen and automatically prompts re-orders based on seasonal velocity.' },
              { title: 'Smart Pricing', icon: Zap, desc: 'Monitors competitor pricing and automatically adjusts your prices to win the buy box while protecting margins.' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition"
              >
                <div className="bg-indigo-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 border-y border-white/5 bg-slate-800/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-white mb-10">Trusted by fast-growing e-commerce brands</h2>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
            <span className="text-2xl font-bold tracking-tight">Shopify</span>
            <span className="text-2xl font-bold tracking-tight">WooCommerce</span>
            <span className="text-2xl font-bold tracking-tight">Stripe</span>
            <span className="text-2xl font-bold tracking-tight">Framer</span>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/20" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Stop losing money to abandoned carts.</h2>
          <p className="text-xl text-slate-300 mb-10">Join 500+ merchants who are automating their revenue recovery with AutoAgent.</p>
          <button onClick={onEnter} className="bg-white text-indigo-900 font-bold text-lg py-4 px-10 rounded-xl shadow-xl hover:scale-105 transition-all">
            Get Started For Free
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
