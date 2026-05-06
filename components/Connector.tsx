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
} from 'lucide-react';
import {
  testConnection,
  syncStorefront,
  Platform,
  ConnectorConfig,
} from '../services/ecommerceConnector';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Storefront Connector</h1>
        <p className="text-gray-500">
          Connect your Shopify or WooCommerce store to sync products and orders.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Step 1: Platform Selection */}
        {!platform ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 text-center mb-6">
              Choose your platform
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  id: 'shopify' as Platform,
                  name: 'Shopify',
                  color: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-400',
                  icon: '🛍️',
                  description: 'Admin API Access Token'
                },
                {
                  id: 'woocommerce' as Platform,
                  name: 'WooCommerce',
                  color: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 hover:border-purple-400',
                  icon: '🛒',
                  description: 'REST API Key/Secret'
                },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-10 rounded-3xl border-2 transition-all duration-300 group ${p.color}`}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{p.icon}</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{p.name}</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                    {p.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${platform === 'shopify' ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-purple-100 dark:bg-purple-500/20'}`}
                >
                  {platform === 'shopify' ? '🛍️' : '🛒'}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white capitalize text-lg tracking-tight">{platform} Connector</h3>
                  {storeName && <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{storeName}</p>}
                </div>
              </div>
              <button onClick={handleReset} className="text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                Change
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Connection Form */}
              {(status === 'idle' || status === 'testing' || status === 'error') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Store URL
                    </label>
                    <input
                      type="url"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      placeholder={
                        platform === 'shopify'
                          ? 'https://your-store.myshopify.com'
                          : 'https://your-store.com'
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {platform === 'shopify' ? 'Admin API Access Token' : 'Consumer Key'}
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={platform === 'shopify' ? 'shpat_xxxxxx' : 'ck_xxxxxx'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {platform === 'woocommerce' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Consumer Secret
                      </label>
                      <input
                        type="password"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder="cs_xxxxxx"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-start gap-2">
                      <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Connection failed:</span> {error}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleTest}
                    disabled={!storeUrl || !apiKey || status === 'testing'}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    {status === 'testing' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Testing Connection...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-5 h-5" /> Test Connection
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Connected — Ready to Sync */}
              {(status === 'connected' || status === 'syncing') && (
                <div className="text-center space-y-5">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Connected to {storeName}
                  </div>

                  <p className="text-gray-500 text-sm">
                    Ready to import your products and orders into AutoAgent.
                  </p>

                  <button
                    onClick={handleSync}
                    disabled={status === 'syncing'}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    {status === 'syncing' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Syncing Data...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" /> Sync Products & Orders
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Sync Results */}
              {status === 'synced' && syncResult && (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900">Sync Complete</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-indigo-50 rounded-xl p-4 text-center">
                      <Package className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{syncResult.products}</div>
                      <div className="text-xs text-gray-500">Products Imported</div>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 text-center">
                      <ShoppingBag className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{syncResult.orders}</div>
                      <div className="text-xs text-gray-500">Orders Imported</div>
                    </div>
                  </div>

                  {syncResult.errors.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                        <AlertTriangle className="w-4 h-4" /> Warnings
                      </div>
                      {syncResult.errors.map((err, i) => (
                        <p key={i} className="text-xs text-amber-600 ml-6">
                          {err}
                        </p>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleSync}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Sync Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Connector;
