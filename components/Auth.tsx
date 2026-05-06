import React, { useState } from 'react';
import { Bot, Mail, Lock, Store, ArrowRight, Loader2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const { signIn, signUp, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      await signIn(email, password);
    } else {
      await signUp(email, password, merchantName);
    }
  };

  const switchMode = () => {
    clearError();
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans selection:bg-ios-blue/30">
      {/* Background Orbs - iOS Style */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-ios-blue/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-ios-purple/20 rounded-full blur-[150px]"
        />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-ios-indigo/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 p-6 lg:p-12 relative z-10">
        {/* Branding Section */}
        <div className="lg:w-1/2 flex flex-col justify-center space-y-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">AutoAgent</h1>
              <p className="text-xs font-black text-ios-blue uppercase tracking-[0.3em] mt-0.5">Autonomous Enterprise</p>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95]"
            >
              Intelligence <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-ios-blue via-ios-purple to-ios-indigo">Unleashed.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-lg lg:text-xl font-medium max-w-md leading-relaxed"
            >
              Initialize your merchant core. Deploy autonomous agents to recover revenue, manage logistics, and scale operations instantly.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            {[
              { icon: Zap, label: '0.4s Latency' },
              { icon: ShieldCheck, label: 'E2E Encryption' },
              { icon: Sparkles, label: 'Core V3 Engine' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-xs font-bold tracking-tight">
                <f.icon className="w-3.5 h-3.5 text-ios-blue" /> {f.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Auth Section */}
        <div className="lg:w-1/2 flex items-center justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md ios-glass !p-10 border-white/10 shadow-2xl relative overflow-hidden"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {mode === 'signin' ? 'Merchant Login' : 'Initialize Core'}
              </h3>
              <p className="text-zinc-400 text-sm font-medium mt-2">
                {mode === 'signin' ? 'Secure authentication required.' : 'Establish your enterprise footprint.'}
              </p>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-ios-red/10 border border-ios-red/20 rounded-2xl text-xs font-bold text-ios-red flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Enterprise Name</label>
                  <div className="relative group">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 transition-colors group-focus-within:text-ios-blue" />
                    <input
                      type="text"
                      required
                      value={merchantName}
                      onChange={e => setMerchantName(e.target.value)}
                      placeholder="e.g. Nexus Logistics"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-zinc-600 focus:bg-white/10 focus:ring-2 focus:ring-ios-blue transition-all outline-none font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Access Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 transition-colors group-focus-within:text-ios-blue" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@enterprise.ai"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-zinc-600 focus:bg-white/10 focus:ring-2 focus:ring-ios-blue transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Security Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 transition-colors group-focus-within:text-ios-blue" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-zinc-600 focus:bg-white/10 focus:ring-2 focus:ring-ios-blue transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full ios-btn-primary py-4 shadow-xl shadow-ios-blue/20"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' ? 'Verify Identity' : 'Deploy Core'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <button 
                onClick={switchMode} 
                className="text-xs font-black text-zinc-500 hover:text-ios-blue uppercase tracking-widest transition-colors"
              >
                {mode === 'signin'
                  ? "Initialize New Account"
                  : 'Return to Login Terminal'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

const AlertCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
