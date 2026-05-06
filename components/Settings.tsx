import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { User, Key, Store, Bell, Save, Trash2, CreditCard, ChevronRight, LogOut, Shield, Info } from 'lucide-react';
import PricingPage from './PricingPage';

const Settings: React.FC = () => {
  const { user, merchant, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'stores' | 'apiKeys' | 'notifications' | 'billing'>('profile');

  const tabs = [
    { id: 'profile', label: 'Account Profile', icon: User, color: 'bg-ios-blue' },
    { id: 'billing', label: 'Subscription Plan', icon: CreditCard, color: 'bg-ios-green' },
    { id: 'stores', label: 'Store Connection', icon: Store, color: 'bg-ios-indigo' },
    { id: 'apiKeys', label: 'Security & APIs', icon: Key, color: 'bg-ios-purple' },
    { id: 'notifications', label: 'Alerts & Messages', icon: Bell, color: 'bg-ios-red' },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-10 px-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
        <p className="text-slate-500 dark:text-zinc-400 font-medium">Configure your autonomous agency and store integrations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Nav - iOS List Style */}
        <div className="w-full lg:w-72">
          <div className="ios-card !p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 group
                  ${activeTab === tab.id ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/20' : 'text-slate-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === tab.id ? 'bg-white/20' : tab.color} text-white shadow-sm`}>
                    <tab.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold tracking-tight">{tab.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'text-white/70' : 'text-slate-300 group-hover:translate-x-1'}`} />
              </button>
            ))}
          </div>

          <div className="mt-8 ios-card !p-2">
            <button
              onClick={signOut}
              className="w-full flex items-center justify-between p-3 text-ios-red hover:bg-ios-red/10 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-ios-red flex items-center justify-center text-white shadow-sm">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold tracking-tight">Sign Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area - Grouped Sections */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white px-2">Account Profile</h2>
                  
                  <div className="ios-card space-y-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-black/5 dark:border-white/5">
                      <div className="w-20 h-20 bg-ios-blue/10 rounded-[2rem] flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-xl">
                        <User className="w-10 h-10 text-ios-blue" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admin Identity</h3>
                        <p className="text-sm text-slate-500 font-medium">{user?.email || 'admin@autoagent.com'}</p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Login Identity</label>
                        <input
                          type="email"
                          disabled
                          value={user?.email || 'admin@autoagent.com'}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl text-slate-400 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                        <input
                          type="text"
                          defaultValue="AutoAgent User"
                          className="w-full px-5 py-4 bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-ios-blue transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button className="ios-btn-primary px-8 py-3.5 text-xs">
                        <Save className="w-4 h-4 mr-2" /> Commit Profile Changes
                      </button>
                    </div>
                  </div>

                  <div className="ios-card bg-ios-blue/5 border-ios-blue/20">
                    <div className="flex gap-4">
                      <div className="p-2 bg-ios-blue/10 rounded-xl">
                        <Shield className="w-5 h-5 text-ios-blue" />
                      </div>
                      <div>
                        <h4 className="font-bold text-ios-blue">Security Status</h4>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">Your account is protected by industry-standard encryption and secure token handling.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stores' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white px-2">Store Connection</h2>
                  
                  <div className="ios-card">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900 rounded-[2rem] border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-ios-indigo rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <Store className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{merchant?.name || 'Shopify Store'}</h3>
                          <p className="text-xs font-black text-ios-green uppercase tracking-widest mt-1">Synchronized & Active</p>
                        </div>
                      </div>
                      <button className="p-3 text-ios-red hover:bg-ios-red/10 rounded-2xl transition-all" title="Sever Connection">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm text-slate-500 font-medium mt-6 px-2">
                      Connected via Shopify Partner API. AutoAgent is currently managing inventory levels and customer recoveries.
                    </p>
                  </div>

                  <button className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[2.5rem] text-slate-400 hover:border-ios-blue hover:text-ios-blue transition-all font-bold uppercase text-[10px] tracking-widest">
                    + Establish New Store Link
                  </button>
                </div>
              )}

              {activeTab === 'apiKeys' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white px-2">Security & APIs</h2>
                  
                  <div className="ios-card space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-ios-purple" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DeepSeek Engine V3</h4>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 px-1">Primary LLM API Key</label>
                        <input
                          type="password"
                          placeholder="••••••••••••••••"
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-ios-blue transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-ios-blue" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Gemini Pro</h4>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 px-1">Vision & Analysis Key</label>
                        <input
                          type="password"
                          placeholder="••••••••••••••••"
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-ios-blue transition-all font-mono"
                        />
                      </div>
                    </div>

                    <button className="ios-btn-primary px-8 py-3.5 text-xs w-full justify-center">
                      <Save className="w-4 h-4 mr-2" /> Encrypt & Store Keys
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white px-2">Alerts & Messages</h2>
                  
                  <div className="ios-card !p-0 overflow-hidden divide-y divide-black/5 dark:divide-white/5">
                    {[
                      { id: 'n1', label: 'Autonomous ROI Audit', desc: 'Monday summary of agent performance.', icon: TrendingUp, color: 'bg-ios-green' },
                      { id: 'n2', label: 'Inventory Depletion', desc: 'Critical stock level warnings.', icon: Package, color: 'bg-ios-orange' },
                      { id: 'n3', label: 'Agent Intervention', desc: 'Manual approval requests.', icon: Bot, color: 'bg-ios-blue' },
                    ].map((pref) => (
                      <div key={pref.id} className="flex items-center justify-between p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pref.color} text-white shadow-sm`}>
                            <pref.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{pref.label}</h4>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">{pref.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-12 h-7 bg-slate-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-ios-blue"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-[2rem] border border-black/5 dark:border-white/5 flex gap-4">
                    <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-black/5 dark:border-white/5">
                      <Info className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Notifications are sent via email and browser push. You can manage mobile notifications in the iOS companion app.</p>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <PricingPage />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
