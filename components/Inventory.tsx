import React, { useState } from 'react';
import { Search, AlertTriangle, TrendingUp, RefreshCw, Zap, X, Copy, Check } from 'lucide-react';
import { Product } from '../types';
import {
  analyzeInventoryItem,
  generateInventoryActionContent,
  InventoryInsight,
} from '../services/inventoryAgent';
import { useDataStore } from '../stores/dataStore';
import { rateLimiter } from '../lib/rateLimiter';
import { LoadingSpinner, EmptyState, ErrorBanner } from './StatusStates';

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
    <div className="space-y-6">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Commander</h1>
          <p className="text-gray-500">AI-driven stock optimization and logistics.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredProducts.length === 0 && (
            <EmptyState
              title="No products found"
              subtitle={
                searchTerm ? 'Try a different search term.' : 'Add products to get started.'
              }
            />
          )}
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleAnalyze(product)}
              className={`bg-white p-4 rounded-xl border border-gray-200 cursor-pointer h-[80px] hover:shadow-md transition-all flex items-center gap-4 group
                ${selectedProduct?.id === product.id ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>
                <div className="text-xs text-gray-500 flex gap-2">
                  <span>{product.id}</span>
                  <span>•</span>
                  <span>{product.category}</span>
                </div>
              </div>

              <div className="text-right mr-2">
                <div className="font-bold text-gray-900">${product.price}</div>
                <div
                  className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1
                  ${
                    product.stock === 0
                      ? 'bg-red-100 text-red-700'
                      : product.stock < 10
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {product.stock} units
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg h-[600px] flex flex-col sticky top-6">
            {!selectedProduct ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <Zap className="w-16 h-16 mb-4 text-indigo-100" />
                <p className="font-medium">
                  Select a product to launch
                  <br />
                  AI Analysis
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50 rounded-t-xl">
                  <div>
                    <h2 className="font-bold text-gray-900">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Current Stock:</span>
                      <span className="text-sm font-bold text-gray-900">
                        {selectedProduct.stock}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  {loading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                      <span className="text-sm font-medium text-gray-500 animate-pulse">
                        Running inventory diagnostics...
                      </span>
                    </div>
                  ) : aiInsight ? (
                    <div className="space-y-6">
                      <div
                        className={`p-4 rounded-xl border-l-4 ${
                          aiInsight.type === 'restock'
                            ? 'bg-amber-50 border-amber-500'
                            : aiInsight.type === 'dead_stock'
                              ? 'bg-rose-50 border-rose-500'
                              : 'bg-green-50 border-green-500'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {aiInsight.type === 'restock' && (
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                          )}
                          {aiInsight.type === 'dead_stock' && (
                            <TrendingUp className="w-5 h-5 text-rose-600 mt-0.5" />
                          )}
                          {aiInsight.type === 'ok' && (
                            <Check className="w-5 h-5 text-green-600 mt-0.5" />
                          )}
                          <div>
                            <h3
                              className={`text-sm font-bold uppercase tracking-wide mb-1 ${
                                aiInsight.type === 'restock'
                                  ? 'text-amber-800'
                                  : aiInsight.type === 'dead_stock'
                                    ? 'text-rose-800'
                                    : 'text-green-800'
                              }`}
                            >
                              {aiInsight.type.replace('_', ' ')}
                            </h3>
                            <p className="text-sm text-gray-800 leading-relaxed">
                              {aiInsight.message}
                            </p>
                          </div>
                        </div>
                      </div>

                      {aiInsight.type !== 'ok' && (
                        <div className="space-y-3">
                          <button
                            onClick={handleExecuteAction}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-indigo-200 shadow-lg"
                            disabled={generating}
                          >
                            {generating ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Zap className="w-4 h-4 fill-current" />
                            )}
                            {generating ? 'Generating Content...' : aiInsight.action}
                          </button>

                          {actionContent && (
                            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-sm text-slate-700 whitespace-pre-line max-h-48 overflow-y-auto">
                                {actionContent}
                              </div>
                              <div className="flex justify-end mt-2">
                                <button className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600">
                                  <Copy className="w-3 h-3" /> Copy to Clipboard
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
