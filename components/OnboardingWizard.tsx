import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Download, CheckCircle, ArrowRight, Loader2, Globe, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { completeOnboarding } = useAuthStore();

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleConnectStore = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nextStep();
    }, 2000);
  };

  const handleSyncData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nextStep();
    }, 2500);
  };

  const handleFinish = () => {
    if (completeOnboarding) {
        completeOnboarding();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-ios-blue/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-ios-purple/10 rounded-full blur-[100px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-xl w-full ios-glass !p-0 overflow-hidden border-white/10 shadow-2xl relative z-10"
      >
        {/* iOS Style Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-white/5 bg-white/[0.02]">
          <div className="flex justify-center mb-4">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={`h-1.5 transition-all duration-500 rounded-full ${s === step ? 'w-8 bg-ios-blue shadow-[0_0_12px_rgba(0,122,255,0.5)]' : s < step ? 'w-4 bg-ios-green' : 'w-4 bg-white/10'}`}
                />
              ))}
            </div>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase tracking-[0.2em] opacity-50">Setup Wizard</h1>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-ios-blue/10 rounded-[2rem] flex items-center justify-center mx-auto border border-ios-blue/20">
                    <Globe className="w-10 h-10 text-ios-blue" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Initialize Domain</h2>
                  <p className="text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                    Link your enterprise storefront to the AutoAgent neural network.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="relative group">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-ios-blue transition-colors" />
                    <input 
                      type="text" 
                      placeholder="enterprise.myshopify.com" 
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-600 focus:bg-white/10 focus:ring-2 focus:ring-ios-blue outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleConnectStore}
                    disabled={loading}
                    className="w-full ios-btn-primary py-4 shadow-xl shadow-ios-blue/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sync Endpoint <ArrowRight className="w-5 h-5 ml-2" /></>}
                  </button>
                  <button onClick={handleConnectStore} className="w-full text-xs font-black text-zinc-500 hover:text-ios-blue uppercase tracking-widest transition-colors py-2">
                    Initialize Demo Instance
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-ios-purple/10 rounded-[2rem] flex items-center justify-center mx-auto border border-ios-purple/20">
                    {loading ? <Zap className="w-10 h-10 text-ios-purple animate-pulse" /> : <Download className="w-10 h-10 text-ios-purple" />}
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Neural Ingestion</h2>
                  <p className="text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                    AutoAgent is currently mapping your store&apos;s digital DNA and behavioral patterns.
                  </p>
                </div>
                
                {loading ? (
                  <div className="space-y-6">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.5 }}
                        className="h-full bg-gradient-to-r from-ios-blue to-ios-purple"
                      />
                    </div>
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-ios-blue uppercase tracking-widest animate-pulse">Syncing Payload...</span>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">88% Complete</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleSyncData}
                    className="w-full ios-btn-primary py-4 shadow-xl shadow-ios-blue/20"
                  >
                    Start Ingestion Protocol
                  </button>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-ios-green/10 rounded-[2rem] flex items-center justify-center mx-auto border border-ios-green/20">
                    <CheckCircle className="w-10 h-10 text-ios-green" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">System Ready</h2>
                  <p className="text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                    Core established. AutoAgent has identified <span className="text-ios-green font-black">$4,200.00</span> in latent recovery potential.
                  </p>
                </div>

                <div className="ios-glass !bg-white/5 p-6 rounded-2xl border-white/5 space-y-4">
                  {[
                    { label: 'Inventory Mapping', status: 'Optimal', icon: Sparkles },
                    { label: 'Revenue Recovery', status: 'Active', icon: Zap },
                    { label: 'Security Layer', status: 'Encrypted', icon: ShieldCheck },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-xs font-bold text-zinc-400">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-ios-green uppercase tracking-widest">{item.status}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleFinish}
                  className="w-full ios-btn-primary py-5 text-lg font-black tracking-tight shadow-2xl shadow-ios-blue/20 group"
                >
                  Enter Command Center 
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingWizard;
