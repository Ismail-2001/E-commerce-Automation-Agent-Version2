import React, { useState } from 'react';
import { ShoppingCart, Send, User, Calendar, DollarSign, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { Cart } from '../types';
import { generateRecoveryEmail } from '../services/recoveryAgent';
import { sendEmail, extractSubject } from '../services/emailService';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { rateLimiter } from '../lib/rateLimiter';

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

  const abandonedCarts = carts.filter(c => c.status === 'abandoned');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abandoned Cart Recovery Agent</h1>
          <p className="text-gray-500">AI-powered sequences to recover lost revenue.</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          <DollarSign className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-900">
            Recoverable: ${abandonedCarts.reduce((acc, c) => acc + c.totalValue, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {step === 'list' ? (
        <div className="grid gap-4">
          {abandonedCarts.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-gray-500">No abandoned carts currently detected.</p>
            </div>
          ) : (
            abandonedCarts.map(cart => (
              <div key={cart.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cart.customerName}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {cart.customerEmail}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(cart.lastActive).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">${cart.totalValue.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{cart.items.length} items</div>
                    {cart.totalValue > 100 && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Discount Eligible
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleStartRecovery(cart)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Recover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <button onClick={() => setStep('list')} className="text-sm font-medium text-gray-500 hover:text-gray-700">
              &larr; Back to List
            </button>
            <div className="text-sm font-semibold text-gray-900">
              Review Recovery Sequence
            </div>
            <div className="w-20" />
          </div>

          <div className="p-6">
            <div className="mb-6 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</label>
                <div className="font-medium text-gray-900">{selectedCart?.customerName}</div>
                <div className="text-sm text-gray-500">{selectedCart?.customerEmail}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cart Details</label>
                <div className="font-medium text-gray-900">{selectedCart?.items.length} Items</div>
                <div className="text-sm text-indigo-600 font-bold">${selectedCart?.totalValue.toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                {isGenerating && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
                AI Generated Draft
              </label>
              <div className="min-h-[300px] w-full p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-gray-700 whitespace-pre-line relative">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm animate-pulse">AI Agent is crafting a personalized response...</span>
                  </div>
                ) : (
                  <textarea
                    value={generatedDraft}
                    onChange={(e) => setGeneratedDraft(e.target.value)}
                    className="w-full h-full bg-transparent border-none focus:ring-0 p-0 text-gray-800 resize-none"
                    rows={12}
                  />
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setStep('list')}
                className="px-6 py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendRecovery}
                disabled={isGenerating || isSending || !generatedDraft}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all hover:shadow-lg active:scale-95"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Personalised Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecoveryAgent;
