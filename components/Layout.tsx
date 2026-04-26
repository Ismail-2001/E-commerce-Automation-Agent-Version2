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
  Menu,
  X,
  Mail,
  Store,
  Camera,
  TrendingUp,
  Link2,
  Activity,
  Users,
  Sun,
  Moon
} from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { merchant, user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'agent', label: 'AutoAgent AI', icon: Bot },
    { id: 'agent-recovery', label: 'Recovery Agent', icon: Mail },
    { id: 'image-analysis', label: 'Image Analysis', icon: Camera },
    { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
    { id: 'connector', label: 'Storefront Sync', icon: Link2 },
    { id: 'agents', label: 'Agent Hub', icon: Users },
    { id: 'activity-log', label: 'Activity Log', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 fixed h-full transition-all" role="navigation" aria-label="Main navigation">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" aria-hidden="true" />
            AutoAgent
          </h1>
          {merchant ? (
            <div className="flex items-center gap-1.5 mt-1">
              <Store className="w-3 h-3 text-slate-500" />
              <p className="text-xs text-slate-500 truncate">{merchant.name}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-1">E-Commerce Intelligence</p>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ViewState)}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          {user && (
            <div className="px-4 py-2 mb-2">
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="w-full flex items-center justify-between px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors mb-2"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5" aria-hidden="true" /> : <Sun className="w-5 h-5" aria-hidden="true" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full flex items-center transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-600'} p-0.5`}>
              <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            aria-label="Navigate to Settings"
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
            <span>Settings</span>
          </button>
          {user && (
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-900/10 rounded-xl transition-colors mt-2"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 px-4 py-3 flex justify-between items-center shadow-md" role="banner">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          <span className="font-bold">AutoAgent</span>
          {merchant && <span className="text-xs text-slate-400 ml-1">• {merchant.name}</span>}
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen}>
          {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/95 z-40 pt-20 px-6 md:hidden">
          <nav className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as ViewState);
                    setMobileMenuOpen(false);
                  }}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={currentView === item.id ? 'page' : undefined}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium
                            ${currentView === item.id ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
            {user && (
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium text-rose-400"
              >
                <LogOut className="w-6 h-6" />
                Sign Out
              </button>
            )}
            
            {/* Mobile dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-lg font-medium text-slate-300 border-t border-slate-800 mt-4"
            >
              <div className="flex items-center gap-4">
                {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div className={`w-10 h-5 rounded-full flex items-center transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-600'} p-0.5`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
