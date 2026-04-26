import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Download, CheckCircle, ArrowRight, Loader2, Play } from 'lucide-react';
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
    }, 1500); // simulate connection delay
  };

  const handleSyncData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nextStep();
    }, 2000); // simulate data sync
  };

  const handleFinish = () => {
    // Calling completeOnboarding will hide the wizard and show Dashboard
    if (completeOnboarding) {
        completeOnboarding();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700"
      >
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2">
          <motion.div 
            className="bg-indigo-600 h-2" 
            initial={{ width: '33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                  <Store className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold dark:text-white mb-2">Connect Your Store</h2>
                  <p className="text-slate-500 dark:text-slate-400">Link your Shopify or WooCommerce store to allow AutoAgent to analyze your data.</p>
                </div>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="mystore.myshopify.com" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                  <button 
                    onClick={handleConnectStore}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connect Store'}
                  </button>
                  <button onClick={handleConnectStore} className="text-sm text-slate-500 hover:text-indigo-600 font-medium">
                    Use demo store instead
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
                  <Download className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold dark:text-white mb-2">Syncing Data</h2>
                  <p className="text-slate-500 dark:text-slate-400">AutoAgent is ingesting your products, orders, and customer history.</p>
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-sm text-indigo-600 font-medium animate-pulse">Analyzing 4,203 data points...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={handleSyncData}
                      className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition"
                    >
                      Start Sync
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold dark:text-white mb-2">You&apos;re All Set!</h2>
                  <p className="text-slate-500 dark:text-slate-400">AutoAgent found $4,200 in recently abandoned carts. Activate the Recovery Agent to win them back.</p>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 py-4 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-[1.02]"
                  >
                    Go to Dashboard <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingWizard;
