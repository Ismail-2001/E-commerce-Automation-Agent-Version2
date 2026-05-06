import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  ClipboardCheck,
  Truck,
  RotateCcw,
  Star,
  X,
  Check,
  Copy,
  Zap,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Order } from '../types';
import { analyzeOrder, generateOrderActionContent, OrderInsight } from '../services/orderAgent';
import { useDataStore } from '../stores/dataStore';
import { rateLimiter } from '../lib/rateLimiter';
import { LoadingSpinner, EmptyState, ErrorBanner } from './StatusStates';
import { motion, AnimatePresence } from 'framer-motion';

const Orders: React.FC = () => {
  const { orders, loading: storeLoading } = useDataStore();
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [aiInsight, setAiInsight] = useState<OrderInsight | null>(null);
  const [actionContent, setActionContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAnalyze = async (order: Order) => {
    setSelectedOrder(order);
    setLoading(true);
    setActionContent('');
    setError(null);

    try {
      const insight = await analyzeOrder(order);
      setAiInsight(insight);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze order.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedOrder || !aiInsight) return;
    if (!rateLimiter.canCall('orders')) return;

    setGenerating(true);
    setError(null);
    try {
      const content = await generateOrderActionContent(selectedOrder, aiInsight.type);
      setActionContent(content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate content.');
    } finally {
      setGenerating(false);
    }
  };

  if (storeLoading) return <LoadingSpinner message="Loading orders..." />;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Shipped':
        return 'bg-ios-blue/10 text-ios-blue';
      case 'Delivered':
        return 'bg-ios-green/10 text-ios-green';
      case 'Pending':
        return 'bg-ios-orange/10 text-ios-orange';
      case 'Returned':
        return 'bg-ios-red/10 text-ios-red';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Shipped':
        return <Truck className="w-4 h-4" />;
      case 'Delivered':
        return <ClipboardCheck className="w-4 h-4" />;
      case 'Pending':
        return <RefreshCw className="w-4 h-4" />;
      case 'Returned':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Order <span className="text-ios-indigo">Intelligence</span></h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Autonomous Fulfillment Engine</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {filteredOrders.length === 0 && (
            <EmptyState
              title="No orders found"
              subtitle={searchTerm ? 'Try a different search term.' : 'Orders will appear here once placed.'}
            />
          )}
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleAnalyze(order)}
                className={`ios-card ios-card-hover group flex items-center gap-5 p-5
                  ${selectedOrder?.id === order.id ? 'ring-2 ring-ios-blue shadow-lg shadow-ios-blue/10' : ''}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getStatusStyle(order.status)} transition-transform group-hover:scale-110`}>
                  {getStatusIcon(order.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate group-hover:text-ios-blue transition-colors">
                      {order.customerName}
                    </h3>
                    <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                    <span>
                      {order.id} • {order.items} items
                    </span>
                    <span>{order.date}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="ios-card !p-0 sticky top-10 overflow-hidden min-h-[500px] flex flex-col">
            {!selectedOrder ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-6">
                <div className="w-20 h-20 bg-ios-blue/10 rounded-[2rem] flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-ios-blue" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">Analysis Engine Ready</p>
                  <p className="text-sm text-slate-400 dark:text-zinc-500 mt-2">
                    Select an order to analyze customer history and sentiment.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 ios-glass dark:border-white/5 flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-xl truncate max-w-[200px]">{selectedOrder.customerName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 font-black uppercase tracking-widest ${getStatusStyle(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-slate-500 hover:text-ios-red transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-[1.5rem] border border-black/5 dark:border-white/5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Items</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedOrder.items} SKU(s)</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-[1.5rem] border border-black/5 dark:border-white/5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order Value</p>
                      <p className="text-xl font-bold text-ios-blue">${selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-10">
                      <RefreshCw className="w-8 h-8 text-ios-blue animate-spin" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                        Analyzing Customer Sentiment...
                      </span>
                    </div>
                  ) : aiInsight ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div
                        className={`p-5 rounded-[2rem] border ${
                          aiInsight.type === 'return_risk'
                            ? 'bg-ios-red/5 border-ios-red/20'
                            : aiInsight.type === 'vip'
                              ? 'bg-ios-purple/5 border-ios-purple/20'
                              : aiInsight.type === 'pending'
                                ? 'bg-ios-orange/5 border-ios-orange/20'
                                : 'bg-ios-green/5 border-ios-green/20'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-xl mt-1 ${
                            aiInsight.type === 'vip' ? 'bg-ios-purple/10 text-ios-purple' : 
                            aiInsight.type === 'return_risk' ? 'bg-ios-red/10 text-ios-red' : 
                            aiInsight.type === 'pending' ? 'bg-ios-orange/10 text-ios-orange' : 'bg-ios-green/10 text-ios-green'
                          }`}>
                            {aiInsight.type === 'vip' ? <Star className="w-5 h-5" /> : 
                             aiInsight.type === 'return_risk' ? <RotateCcw className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className={`text-xs font-black uppercase tracking-[0.15em] mb-2 ${
                                aiInsight.type === 'vip' ? 'text-ios-purple' : 
                                aiInsight.type === 'return_risk' ? 'text-ios-red' : 
                                aiInsight.type === 'pending' ? 'text-ios-orange' : 'text-ios-green'
                              }`}>
                              {aiInsight.type.split('_').join(' ')} Profile
                            </h3>
                            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                              {aiInsight.message}
                            </p>
                          </div>
                        </div>
                      </div>

                      {aiInsight.type !== 'ok' && (
                        <div className="space-y-4">
                          <button
                            onClick={handleExecuteAction}
                            className="ios-btn-primary w-full py-4 text-sm"
                            disabled={generating}
                          >
                            {generating ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Zap className="w-5 h-5" />
                            )}
                            {generating ? 'Drafting Intelligence...' : aiInsight.action}
                          </button>

                          <AnimatePresence>
                            {actionContent && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                                <div className="bg-slate-50 dark:bg-zinc-900 rounded-[1.5rem] p-4 border border-black/5 dark:border-white/5 text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-line max-h-48 overflow-y-auto font-medium">
                                  {actionContent}
                                </div>
                                <div className="flex justify-end">
                                  <button className="text-xs font-bold flex items-center gap-1.5 text-ios-blue hover:opacity-70 transition-all uppercase tracking-widest">
                                    <Copy className="w-3.5 h-3.5" /> Copy Draft
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
