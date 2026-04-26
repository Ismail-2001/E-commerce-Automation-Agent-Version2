import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { User, Key, Store, Bell, Save, Trash2, CreditCard } from 'lucide-react';
import PricingPage from './PricingPage';

const Settings: React.FC = () => {
  const { user, merchant, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'stores' | 'apiKeys' | 'notifications' | 'billing'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'stores', label: 'Connected Stores', icon: Store },
    { id: 'apiKeys', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto dark:text-slate-200"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account, stores, and application preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              {tab.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Profile Information</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your account details here.</p>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'admin@autoagent.com'}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'stores' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Connected Stores</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage stores linked to your AutoAgent account.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{merchant?.name || 'Demo Store'}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Shopify via API • Connected</p>
                    </div>
                  </div>
                  <button className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition" title="Disconnect Store">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition w-full">
                + Connect Another Store
              </button>
            </div>
          )}

          {activeTab === 'apiKeys' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">API Integrations</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage keys for external AI and storefront providers.</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Anthropic API Key (Optional)</label>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  <Save className="w-4 h-4" /> Save Keys
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Notification Preferences</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Control when and how AutoAgent alerts you.</p>
              </div>
              <div className="space-y-4">
                {[
                  { id: 'n1', label: 'Weekly ROI Report', desc: 'Get a summary of actions and recovered value every Monday.' },
                  { id: 'n2', label: 'Low Stock Alerts', desc: 'Immediate notification when inventory drops below threshold.' },
                  { id: 'n3', label: 'Auto-Pilot Interventions', desc: 'Alert when an agent requires human approval.' },
                ].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{pref.label}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{pref.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <PricingPage />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
