import React, { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingBag,
  Package,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import {
  testConnection,
  syncStorefront,
  Platform,
  ConnectorConfig,
} from '../services/ecommerceConnector';
import { motion, AnimatePresence } from 'framer-motion';

const Connector: React.FC = () => {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [storeUrl, setStoreUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'testing' | 'connected' | 'syncing' | 'synced' | 'error'
  >('idle');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [syncResult, setSyncResult] = useState<{
    products: number;
    orders: number;
    errors: string[];
  } | null>(null);

  const getConfig = (): ConnectorConfig => ({
    platform: platform!,
    storeUrl: storeUrl.replace(/\/$/, ''),
    apiKey,
    apiSecret,
  });

  const handleTest = async () => {
    if (!platform || !storeUrl || !apiKey) return;
    setStatus('testing');
    setError('');
    const result = await testConnection(getConfig());
    if (result.success) {
      setStatus('connected');
      setStoreName(result.storeName || storeUrl);
    } else {
      setStatus('error');
      setError(result.error || 'Connection failed');
    }
  };

  const handleSync = async () => {
    setStatus('syncing');
    setSyncResult(null);
    const result = await syncStorefront(getConfig());
    setSyncResult({
      products: result.productsImported,
      orders: result.ordersImported,
      errors: result.errors,
    });
    setStatus('synced');
  };

  const handleReset = () => {
    setPlatform(null);
    setStoreUrl('');
    setApiKey('');
    setApiSecret('');
    setStatus('idle');
    setStoreName('');
    setError('');
    setSyncResult(null);
  };

  return (
    <div className="space-y-8 pb-20">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
          Storefront <span className="text-ios-blue">Sync</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">
          Merchant Endpoint Configuration
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!platform ? (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-ios-blue/10 rounded-[2rem] flex items-center justify-center mx-auto border border-ios-blue/20">
                  <Globe className="w-10 h-10 text-ios-blue" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select Platform</h2>
                <p className="text-sm text-zinc-500 font-medium">Choose your storefront to begin data synchronization.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { id: 'shopify' as Platform, name: 'Shopify', icon: '🛍️', desc: 'Admin API Access Token', color: 'ios-green' },
                  { id: 'woocommerce' as Platform, name: 'WooCommerce', icon: '🛒', desc: 'REST API Key/Secret', color: 'ios-purple' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className="ios-card ios-card-hover !p-10 text-center group"
                  >
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-500">{p.icon}</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{p.name}</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-3">{p.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="ios-card !p-0 overflow-hidden">
                {/* Header */}
                <div className="p-8 ios-glass flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white/10 ${platform === 'shopify' ? 'bg-ios-green/10' : 'bg-ios-purple/10'}`}>
                      {platform === 'shopify' ? '🛍️' : '🛒'}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white capitalize text-xl tracking-tight">{platform}</h3>
                      {storeName && <p className="text-[10px] font-black text-ios-green uppercase tracking-[0.2em] mt-0.5">{storeName}</p>}
                    </div>
                  </div>
                  <button onClick={handleReset} className="flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-ios-blue transition-colors uppercase tracking-widest bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full">
                    <ArrowLeft className="w-3.5 h-3.5" /> Change
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  {/* Connection Form */}
                  {(status === 'idle' || status === 'testing' || status === 'error') && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Store URL</label>
                        <input
                          type="url"
                          value={storeUrl}
                          onChange={(e) => setStoreUrl(e.target.value)}
                          placeholder={platform === 'shopify' ? 'https://your-store.myshopify.com' : 'https://your-store.com'}
                          className="ios-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
                          {platform === 'shopify' ? 'Admin API Access Token' : 'Consumer Key'}
                        </label>
                        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={platform === 'shopify' ? 'shpat_xxxxxx' : 'ck_xxxxxx'} className="ios-input" />
                      </div>
                      {platform === 'woocommerce' && (
                        <div>
                          <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Consumer Secret</label>
                          <input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="cs_xxxxxx" className="ios-input" />
                        </div>
                      )}

                      {error && (
                        <div className="p-5 bg-ios-red/5 border border-ios-red/20 rounded-2xl flex items-start gap-4">
                          <XCircle className="w-5 h-5 text-ios-red flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-black text-ios-red uppercase tracking-widest mb-1">Connection Failed</p>
                            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">{error}</p>
                          </div>
                        </div>
                      )}

                      <button onClick={handleTest} disabled={!storeUrl || !apiKey || status === 'testing'} className="ios-btn-primary w-full !py-5 !text-xs">
                        {status === 'testing' ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Establishing Connection...</>
                        ) : (
                          <><Link2 className="w-5 h-5" /> Test Connection</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Connected */}
                  {(status === 'connected' || status === 'syncing') && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-6">
                      <div className="w-20 h-20 bg-ios-green/10 rounded-[2rem] flex items-center justify-center mx-auto border border-ios-green/20">
                        <ShieldCheck className="w-10 h-10 text-ios-green" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-ios-green/10 text-ios-green rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                          <CheckCircle2 className="w-4 h-4" /> Secure Connection Established
                        </div>
                        <p className="text-sm text-zinc-500 font-medium mt-4">Ready to import products and orders into AutoAgent.</p>
                      </div>
                      <button onClick={handleSync} disabled={status === 'syncing'} className="ios-btn-primary w-full !py-5 !text-xs">
                        {status === 'syncing' ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Synchronizing Data...</>
                        ) : (
                          <><RefreshCw className="w-5 h-5" /> Sync Products & Orders</>
                        )}
                      </button>
                    </motion.div>
                  )}

                  {/* Sync Results */}
                  {status === 'synced' && syncResult && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 py-4">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-ios-green/10 rounded-[2rem] flex items-center justify-center mx-auto border border-ios-green/20">
                          <Zap className="w-10 h-10 text-ios-green" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sync Complete</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="ios-card !p-6 text-center">
                          <div className="w-12 h-12 bg-ios-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-ios-blue/20">
                            <Package className="w-6 h-6 text-ios-blue" />
                          </div>
                          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{syncResult.products}</div>
                          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Products</div>
                        </div>
                        <div className="ios-card !p-6 text-center">
                          <div className="w-12 h-12 bg-ios-indigo/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-ios-indigo/20">
                            <ShoppingBag className="w-6 h-6 text-ios-indigo" />
                          </div>
                          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{syncResult.orders}</div>
                          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Orders</div>
                        </div>
                      </div>

                      {syncResult.errors.length > 0 && (
                        <div className="p-5 bg-ios-orange/5 border border-ios-orange/20 rounded-2xl">
                          <div className="flex items-center gap-3 text-ios-orange text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                            <AlertTriangle className="w-4 h-4" /> Warnings Detected
                          </div>
                          {syncResult.errors.map((err, i) => (
                            <p key={i} className="text-xs text-zinc-500 font-medium ml-7 mt-1">{err}</p>
                          ))}
                        </div>
                      )}

                      <button onClick={handleSync} className="ios-btn-secondary w-full !py-5 !text-xs">
                        <RefreshCw className="w-4 h-4" /> Sync Again
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Connector;
