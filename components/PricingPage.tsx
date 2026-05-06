import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Shield, ArrowRight, Sparkles, Star, Globe } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const PricingPage: React.FC<{ onSubscribe?: () => void }> = ({ onSubscribe }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const tiers = [
    {
      name: 'Core',
      price: billingCycle === 'monthly' ? 49 : 39,
      description: 'Foundational AI capabilities for single-store environments.',
      features: [
        'Single Node Deployment',
        'Email Draft Synthesis',
        '100 Neural Actions / mo',
        'Standard Performance Log',
      ],
      missing: ['Autonomous Execution', 'Multi-Store Grid', 'Custom Logic Hub'],
      cta: 'Initialize Node',
      popular: false,
      color: 'ios-blue',
    },
    {
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 149 : 119,
      description: 'End-to-end autonomous workflows for high-growth merchants.',
      features: [
        '3 Synchronized Stores',
        'Autonomous Recovery Engine',
        '1,000 Neural Actions / mo',
        '3 Command Seats',
        'Advanced ROI Projections',
      ],
      missing: ['Unlimited Store Grid'],
      cta: 'Deploy Enterprise',
      popular: true,
      color: 'ios-purple',
    },
    {
      name: 'Infinite',
      price: billingCycle === 'monthly' ? 349 : 279,
      description: 'Unlimited orchestration for agencies and global portfolios.',
      features: [
        'Unlimited Store Grid',
        'Custom Neural Logic',
        'Unlimited Actions',
        'Dedicated Solutions Architect',
        'Direct API Ingestion',
        'Predictive Churn Analysis',
      ],
      missing: [],
      cta: 'Contact Protocol',
      popular: false,
      color: 'ios-indigo',
    },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center py-16 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-tight">
          Select Your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-ios-blue via-ios-purple to-ios-indigo">Operational Scale.</span>
        </h2>
        <p className="text-lg font-medium text-slate-500 dark:text-zinc-400">
          Initialize your command center with precision. No hidden overhead. Autonomous execution at scale.
        </p>

        {/* Billing Toggle - iOS Segmented Control Style */}
        <div className="mt-10 flex justify-center p-1 bg-black/5 dark:bg-white/5 rounded-2xl w-fit mx-auto backdrop-blur-xl border border-black/5 dark:border-white/5">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${billingCycle === 'annual' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Annually
            {billingCycle !== 'annual' && (
              <span className="absolute -top-3 -right-3 bg-ios-green text-white text-[8px] px-2 py-1 rounded-full font-black animate-bounce shadow-lg">
                -20%
              </span>
            )}
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full px-4">
        {tiers.map((tier, index) => (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={tier.name}
            className={`ios-card group relative flex flex-col ${tier.popular ? 'ring-4 ring-ios-purple/20 !border-ios-purple/30 scale-105 z-10 shadow-2xl shadow-ios-purple/10' : 'ios-card-hover'}`}
          >
            {tier.popular && (
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                <span className="bg-gradient-to-r from-ios-purple to-ios-indigo text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-xl flex items-center gap-2">
                  <Star className="w-3 h-3 fill-white" /> Recommended
                </span>
              </div>
            )}
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{tier.name}</h3>
                <div className={`w-10 h-10 rounded-xl bg-${tier.color}/10 flex items-center justify-center`}>
                  {tier.name === 'Core' && <Zap className="w-5 h-5 text-ios-blue" />}
                  {tier.name === 'Enterprise' && <Sparkles className="w-5 h-5 text-ios-purple" />}
                  {tier.name === 'Infinite' && <Globe className="w-5 h-5 text-ios-indigo" />}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 leading-relaxed">{tier.description}</p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">${tier.price}</span>
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">/ Node</span>
              </div>
              <div className="text-[10px] font-black text-ios-green uppercase tracking-widest mt-2">Billed {billingCycle}</div>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1">
              {tier.features.map(f => (
                <li key={f} className="flex gap-3 text-sm items-start">
                  <div className="mt-1 w-4 h-4 rounded-full bg-ios-green/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-ios-green stroke-[4]" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-zinc-300 tracking-tight">{f}</span>
                </li>
              ))}
              {tier.missing.map(m => (
                <li key={m} className="flex gap-3 text-sm items-start opacity-30 grayscale">
                  <div className="mt-1 w-4 h-4 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <X className="w-2.5 h-2.5 text-slate-400 stroke-[4]" />
                  </div>
                  <span className="font-bold text-slate-400 tracking-tight">{m}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={onSubscribe}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 ${
                tier.popular 
                  ? 'ios-btn-primary shadow-xl shadow-ios-purple/30' 
                  : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              {tier.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-20 px-8 py-4 ios-glass rounded-full flex items-center gap-4 border-white/5">
        <Shield className="w-5 h-5 text-ios-green" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Enterprise-Grade Security • Stripe Protocol Verified</span>
      </div>
    </div>
  );
};

export default PricingPage;
