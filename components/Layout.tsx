import React from 'react';
import { ViewState } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Bot,
  Settings,
  LogOut,
  Mail,
  Store,
  Camera,
  TrendingUp,
  Link2,
  Activity,
  Users,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const { merchant, user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const mainNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'inventory', label: 'Stock', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'agent', label: 'AI', icon: Bot },
    { id: 'agents', label: 'Hub', icon: Users },
  ];

  const secondaryNavItems = [
    { id: 'agent-recovery', label: 'Recovery Agent', icon: Mail },
    { id: 'image-analysis', label: 'Image Analysis', icon: Camera },
    { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
    { id: 'connector', label: 'Storefront Sync', icon: Link2 },
    { id: 'activity-log', label: 'Activity Log', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-ios-bg-light)] dark:bg-[var(--color-ios-bg-dark)] transition-colors duration-500">
      {/* Sidebar - Desktop (iOS Style) */}
      <aside className="hidden lg:flex flex-col w-72 fixed h-full bg-slate-100/50 dark:bg-zinc-900/50 backdrop-blur-3xl border-r border-black/5 dark:border-white/5 z-40">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-ios-blue rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-ios-blue/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AutoAgent</h1>
          </div>
          {merchant && (
            <div className="flex items-center gap-2 px-1">
              <Store className="w-3.5 h-3.5 text-ios-blue" />
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider truncate">{merchant.name}</span>
            </div>
          )}
        </div>

        <div className="flex-1 px-4 space-y-6 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            <p className="px-4 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-2">Main</p>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as ViewState)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-300 group
                    ${isActive
                      ? 'bg-white dark:bg-zinc-800 text-ios-blue shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-zinc-400'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-ios-blue/10' : 'bg-transparent'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-2">Intelligence</p>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as ViewState)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-300 group
                    ${isActive
                      ? 'bg-white dark:bg-zinc-800 text-ios-blue shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-zinc-400'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-ios-blue/10' : 'bg-transparent'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <span className="font-semibold text-sm">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
            </div>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-ios-blue' : 'bg-slate-300'}`}>
              <motion.div
                animate={{ x: theme === 'dark' ? 16 : 0 }}
                className="w-4 h-4 bg-white rounded-full shadow-md"
              />
            </div>
          </button>
          
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 dark:text-zinc-400 hover:text-ios-blue transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-semibold text-sm">Settings</span>
          </button>

          {user && (
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-ios-red hover:opacity-80 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Top Header (Clean iOS Style) */}
      <header className="lg:hidden fixed top-0 w-full h-16 ios-glass z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ios-blue rounded-[0.8rem] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg">AutoAgent</span>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 bg-black/5 dark:bg-white/5 rounded-full"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Tab Bar (iOS Style) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-black/5 dark:border-white/10 flex justify-around items-center px-4 pb-4 z-50">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewState)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-ios-blue' : 'text-slate-400 dark:text-zinc-500'}`}
            >
              <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              {isActive && <motion.div layoutId="tab-indicator" className="w-1 h-1 bg-ios-blue rounded-full absolute -bottom-1" />}
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 p-4 lg:p-10 pt-20 lg:pt-10 pb-32 lg:pb-10 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
