import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Shield, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const PricingPage: React.FC<{ onSubscribe?: () => void }> = ({ onSubscribe }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const tiers = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? 49 : 39,
      description: 'Perfect for single stores just getting started with AI automation.',
      features: [
        '1 Connected Store',
        'Email Drafts Only (Manual Send)',
        '100 AI Actions / month',
        'Basic Dashboard Analytics',
      ],
      missing: ['Auto-Pilot Mode', 'Multi-store Support', 'Custom AI Rules'],
      cta: 'Start 14-Day Free Trial',
      popular: false,
    },
    {
      name: 'Growth',
      price: billingCycle === 'monthly' ? 149 : 119,
      description: 'For growing brands that need end-to-end autonomous workflows.',
      features: [
        'Up to 3 Connected Stores',
        'Auto-Pilot Recovery Emails',
        '1,000 AI Actions / month',
        'Team Access (3 Seats)',
        'Weekly Action Reports',
      ],
      missing: ['Custom AI Rules'],
      cta: 'Start 14-Day Free Trial',
      popular: true,
    },
    {
      name: 'Scale',
      price: billingCycle === 'monthly' ? 349 : 279,
      description: 'Advanced features for agencies and multi-brand operations.',
      features: [
        'Unlimited Stores',
        'Custom AI Workflow Rules',
        'Unlimited AI Actions',
        'Dedicated Support Manager',
        'API Access',
        'Predictive Churn Detection',
      ],
      missing: [],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-5xl mb-4">
          Simple pricing, <span className="text-indigo-600 dark:text-indigo-400">massive ROI.</span>
        </h2>
        <p className="text-xl text-slate-500 dark:text-slate-400">
          Try AutoAgent risk-free for 14 days. If it doesn&apos;t make you more money than it costs, cancel anytime.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex justify-center items-center gap-3">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(c => c === 'monthly' ? 'annual' : 'monthly')}
            className="relative inline-flex h-7 w-14 items-center rounded-full bg-indigo-600 transition-colors"
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${billingCycle === 'annual' ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-medium flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            Annually <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        {tiers.map((tier, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={tier.name}
            className={`relative rounded-3xl p-8 shadow-xl ${
              tier.popular 
                ? 'bg-gradient-to-b from-indigo-600 to-purple-700 text-white border-none transform md:-translate-y-4 shadow-indigo-500/30' 
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tier.popular && (
              <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Most Popular
                </span>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className={`text-2xl font-bold ${tier.popular ? 'text-white' : ''}`}>{tier.name}</h3>
              <p className={`mt-2 text-sm ${tier.popular ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>{tier.description}</p>
            </div>
            
            <div className="mb-6">
              <span className="text-5xl font-extrabold tracking-tight">${tier.price}</span>
              <span className={`text-sm font-medium ${tier.popular ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {tier.features.map(f => (
                <li key={f} className="flex gap-3 text-sm">
                  <Check className={`w-5 h-5 shrink-0 ${tier.popular ? 'text-indigo-300' : 'text-emerald-500'}`} />
                  <span className={tier.popular ? 'text-white' : 'text-slate-700 dark:text-slate-300'}>{f}</span>
                </li>
              ))}
              {tier.missing.map(m => (
                <li key={m} className="flex gap-3 text-sm opacity-50">
                  <X className="w-5 h-5 shrink-0 text-slate-400" />
                  <span className={tier.popular ? 'text-indigo-200' : 'text-slate-500'}>{m}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={onSubscribe}
              className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                tier.popular 
                  ? 'bg-white text-indigo-600 hover:bg-slate-50 hover:scale-105' 
                  : 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-white hover:bg-indigo-100 dark:hover:bg-slate-600'
              }`}
            >
              {tier.cta} <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-16 text-center flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
        <Shield className="w-5 h-5" /> Secured via Stripe Billing
      </div>
    </div>
  );
};

export default PricingPage;
