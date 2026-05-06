import React, { useState } from 'react';
import { Send, User, Calendar, DollarSign, Loader2, CheckCircle2, Mail, ChevronLeft, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Cart } from '../types';
import { generateRecoveryEmail } from '../services/recoveryAgent';
import { sendEmail, extractSubject } from '../services/emailService';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { rateLimiter } from '../lib/rateLimiter';
import { motion, AnimatePresence } from 'framer-motion';

const RecoveryAgent: React.FC = () => {
  const { carts, updateCartStatus, logActivity } = useDataStore();
  const { merchant } = useAuthStore();
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState<'list' | 'preview'>('list');

  const handleStartRecovery = async (cart: Cart) => {
    if (!rateLimiter.canCall('recovery')) return;

    setSelectedCart(cart);
    setStep('preview');
    setIsGenerating(true);
    setGeneratedDraft('');

    const draft = await generateRecoveryEmail(cart);
    setGeneratedDraft(draft);
    setIsGenerating(false);
  };

  const handleSendRecovery = async () => {
    if (!selectedCart) return;

    setIsSending(true);

    const subject = extractSubject(generatedDraft);
    const result = await sendEmail({
      to: selectedCart.customerEmail,
      customerName: selectedCart.customerName,
      subject,
      body: generatedDraft,
    });

    if (result.success) {
      await updateCartStatus(selectedCart.id, 'recovered');

      if (merchant) {
        await logActivity(
          merchant.id,
          'Recovery',
          `Sent recovery email to ${selectedCart.customerName} (Cart value: $${selectedCart.totalValue.toFixed(2)})`
        );
      }

      setStep('list');
      setSelectedCart(null);
    }
    setIsSending(false);
  };

  const abandonedCarts = carts.filter((c) => c.status === 'abandoned');
  const totalRecoverable = abandonedCarts.reduce((acc, c) => acc + c.totalValue, 0);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Recovery <span className="text-ios-blue">Intelligence</span></h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Autonomous Revenue Recapture</p>
        </div>
        <div className="ios-glass px-6 py-4 rounded-[2rem] flex items-center gap-4 border border-black/5 dark:border-white/5 shadow-sm">
          <div className="w-10 h-10 bg-ios-green/10 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-ios-green" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potential Revenue</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">${totalRecoverable.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid gap-4"
          >
            {abandonedCarts.length === 0 ? (
              <div className="ios-card py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-ios-green/10 rounded-[2rem] flex items-center justify-center mb-6">
                  <ShieldCheck className="w-10 h-10 text-ios-green" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Zero Leaks Detected</h3>
                <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-sm">
                  All shopping carts are either processed or within standard active windows.
                </p>
              </div>
            ) : (
              abandonedCarts.map((cart, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={cart.id}
                  className="ios-card ios-card-hover p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
                      <User className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{cart.customerName}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> {cart.customerEmail}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(cart.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 pl-4 border-l border-black/5 dark:border-white/5">
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">${cart.totalValue.toLocaleString()}</div>
                      <div className="text-[10px] font-black text-ios-blue uppercase tracking-widest mt-1">{cart.items.length} Essential Items</div>
                    </div>
                    <button
                      onClick={() => handleStartRecovery(cart)}
                      className="ios-btn-primary px-8 py-3 text-xs"
                    >
                      Initialize AI Recovery <Zap className="w-3.5 h-3.5 ml-2" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="ios-card !p-0 overflow-hidden shadow-2xl"
          >
            <div className="p-6 ios-glass border-b border-black/5 dark:border-white/5 flex items-center justify-between z-10 relative">
              <button
                onClick={() => setStep('list')}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-ios-blue transition-colors group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Intelligence List
              </button>
              <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Synthesis Engine Output</div>
              <div className="w-20" />
            </div>

            <div className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 dark:bg-zinc-900 rounded-[1.5rem] border border-black/5 dark:border-white/5 shadow-inner">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Customer Profile</label>
                  <div className="font-bold text-slate-900 dark:text-white text-lg">{selectedCart?.customerName}</div>
                  <div className="text-sm font-medium text-slate-500 mt-1">{selectedCart?.customerEmail}</div>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-zinc-900 rounded-[1.5rem] border border-black/5 dark:border-white/5 shadow-inner">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Economic Impact</label>
                  <div className="font-bold text-slate-900 dark:text-white text-lg">{selectedCart?.items.length} Products Pending</div>
                  <div className="text-sm font-black text-ios-blue mt-1 uppercase tracking-widest">${selectedCart?.totalValue.toLocaleString()} Potential Value</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-ios-blue" /> Personalized Recovery Strategy
                </label>
                <div className="relative min-h-[400px] bg-white dark:bg-zinc-900 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-xl overflow-hidden">
                  {isGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-ios-blue/10 rounded-[2rem] flex items-center justify-center animate-pulse">
                        <Loader2 className="w-8 h-8 text-ios-blue animate-spin" />
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
                        Analyzing behavioral patterns...
                      </span>
                    </div>
                  ) : (
                    <textarea
                      value={generatedDraft}
                      onChange={(e) => setGeneratedDraft(e.target.value)}
                      className="w-full h-full bg-transparent border-none focus:ring-0 p-8 text-slate-800 dark:text-zinc-200 resize-none font-medium leading-relaxed scrollbar-hide"
                      rows={15}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sent via secure SMTP</span>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button
                    onClick={() => setStep('list')}
                    className="flex-1 md:flex-none px-8 py-4 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    disabled={isSending}
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSendRecovery}
                    disabled={isGenerating || isSending || !generatedDraft}
                    className="flex-1 md:flex-none ios-btn-primary px-10 py-4 shadow-xl shadow-ios-blue/20"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-3" /> Transmitting...
                      </>
                    ) : (
                      <>
                        Deploy Sequence <ArrowRight className="w-5 h-5 ml-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecoveryAgent;
