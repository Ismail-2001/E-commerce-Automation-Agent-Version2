import React, { useState } from 'react';
import { Search, AlertTriangle, TrendingUp, RefreshCw, Zap, X, Copy, Check, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import {
  analyzeInventoryItem,
  generateInventoryActionContent,
  InventoryInsight,
} from '../services/inventoryAgent';
import { useDataStore } from '../stores/dataStore';
import { rateLimiter } from '../lib/rateLimiter';
import { LoadingSpinner, EmptyState, ErrorBanner } from './StatusStates';
import { motion, AnimatePresence } from 'framer-motion';

const Inventory: React.FC = () => {
  const { products, loading: storeLoading } = useDataStore();
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [aiInsight, setAiInsight] = useState<InventoryInsight | null>(null);
  const [actionContent, setActionContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAnalyze = async (product: Product) => {
    setSelectedProduct(product);
    setLoading(true);
    setActionContent('');
    setError(null);

    try {
      const insight = await analyzeInventoryItem(product);
      setAiInsight(insight);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze product.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedProduct || !aiInsight) return;
    if (!rateLimiter.canCall('inventory')) return;

    setGenerating(true);
    setError(null);
    try {
      const content = await generateInventoryActionContent(selectedProduct, aiInsight.type);
      setActionContent(content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate content.');
    } finally {
      setGenerating(false);
    }
  };

  if (storeLoading) return <LoadingSpinner message="Loading inventory..." />;

  return (
    <div className="space-y-8 pb-20">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Stock <span className="text-ios-orange">Commander</span></h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">AI-Powered Inventory Intelligence</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {filteredProducts.length === 0 && (
            <EmptyState
              title="No products found"
              subtitle={searchTerm ? 'Try a different search term.' : 'Add products to get started.'}
            />
          )}
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleAnalyze(product)}
                className={`ios-card ios-card-hover group flex flex-col sm:flex-row items-center gap-5 p-5 w-full
                  ${selectedProduct?.id === product.id ? 'ring-2 ring-ios-blue shadow-lg shadow-ios-blue/10' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 sm:w-16 sm:h-16 rounded-[1.25rem] object-cover bg-slate-100 dark:bg-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.stock < 10 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-ios-orange rounded-full border-2 border-white dark:border-zinc-900" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg">
                    {product.name}
                  </h3>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 flex flex-wrap justify-center sm:justify-start gap-2 uppercase tracking-[0.1em] mt-1">
                    <span>{product.category}</span>
                    <span>•</span>
                    <span>SKU: {product.id}</span>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-0">
                  <div className="font-bold text-slate-900 dark:text-white text-xl">${product.price}</div>
                  <div
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full inline-block sm:mt-2 uppercase tracking-widest
                    ${
                      product.stock === 0
                        ? 'bg-ios-red/10 text-ios-red'
                        : product.stock < 10
                          ? 'bg-ios-orange/10 text-ios-orange'
                          : 'bg-ios-green/10 text-ios-green'
                    }`}
                  >
                    {product.stock} units
                  </div>
                </div>
                <ChevronRight className="hidden sm:block w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="ios-card !p-0 sticky top-10 overflow-hidden min-h-[500px] flex flex-col">
            {!selectedProduct ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-6">
                <div className="w-20 h-20 bg-ios-blue/10 rounded-[2rem] flex items-center justify-center">
                  <Zap className="w-10 h-10 text-ios-blue" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">AI Analysis Ready</p>
                  <p className="text-sm text-slate-400 dark:text-zinc-500 mt-2">
                    Select a product from the list to launch automated diagnostics.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 ios-glass dark:border-white/5 flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-xl truncate max-w-[200px]">{selectedProduct.name}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory Diagnostic</p>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-slate-500 hover:text-ios-red transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-[1.5rem] border border-black/5 dark:border-white/5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Stock</p>
                      <p className={`text-xl font-bold ${selectedProduct.stock < 10 ? 'text-ios-orange' : 'text-ios-green'}`}>
                        {selectedProduct.stock} Units
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-[1.5rem] border border-black/5 dark:border-white/5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unit Price</p>
                      <p className="text-xl font-bold text-ios-blue">${selectedProduct.price}</p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-10">
                      <RefreshCw className="w-8 h-8 text-ios-blue animate-spin" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                        Scanning SKU: {selectedProduct.id}
                      </span>
                    </div>
                  ) : aiInsight ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div
                        className={`p-5 rounded-[2rem] border ${
                          aiInsight.type === 'restock'
                            ? 'bg-ios-orange/5 border-ios-orange/20'
                            : aiInsight.type === 'dead_stock'
                              ? 'bg-ios-red/5 border-ios-red/20'
                              : 'bg-ios-green/5 border-ios-green/20'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-xl mt-1 ${
                            aiInsight.type === 'restock' ? 'bg-ios-orange/10 text-ios-orange' : 
                            aiInsight.type === 'dead_stock' ? 'bg-ios-red/10 text-ios-red' : 'bg-ios-green/10 text-ios-green'
                          }`}>
                            {aiInsight.type === 'restock' ? <AlertTriangle className="w-5 h-5" /> : 
                             aiInsight.type === 'dead_stock' ? <TrendingUp className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className={`text-xs font-black uppercase tracking-[0.15em] mb-2 ${
                                aiInsight.type === 'restock' ? 'text-ios-orange' : 
                                aiInsight.type === 'dead_stock' ? 'text-ios-red' : 'text-ios-green'
                              }`}>
                              {aiInsight.type.replace('_', ' ')} Detected
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
                              <Bot className="w-5 h-5" />
                            )}
                            {generating ? 'Processing AI Logic...' : aiInsight.action}
                          </button>

                          <AnimatePresence>
                            {actionContent && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                                <div className="bg-slate-50 dark:bg-zinc-900 rounded-[1.5rem] p-4 border border-black/5 dark:border-white/5 text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-line max-h-48 overflow-y-auto font-medium">
                                  {actionContent}
                                </div>
                                <div className="flex justify-end">
                                  <button className="text-xs font-bold flex items-center gap-1.5 text-ios-blue hover:opacity-70 transition-all uppercase tracking-widest">
                                    <Copy className="w-3.5 h-3.5" /> Copy Analysis
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

export default Inventory;
