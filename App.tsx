import React, { useState, useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import ChatAgent from './components/ChatAgent';
import RecoveryAgent from './components/RecoveryAgent';
import ErrorBoundary from './components/ErrorBoundary';
import { ViewState } from './types';
import { useAuthStore } from './stores/authStore';
import { useDataStore } from './stores/dataStore';
import { useThemeStore } from './stores/themeStore';
import { Loader2, Bot, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import OnboardingWizard from './components/OnboardingWizard';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import ActivityLog from './components/ActivityLog';

// Lazy-loaded heavy components
const ImageAnalysis = lazy(() => import('./components/ImageAnalysis'));
const Forecasting = lazy(() => import('./components/Forecasting'));
const Connector = lazy(() => import('./components/Connector'));
const AgentHub = lazy(() => import('./components/AgentHub'));
const Auth = lazy(() => import('./components/Auth'));

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="relative">
        <Loader2 className="w-12 h-12 text-ios-blue animate-spin mx-auto opacity-20" />
        <Bot className="w-6 h-6 text-ios-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing Component</p>
    </motion.div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isStarted, setIsStarted] = useState(false);
  const { user, merchant, loading: authLoading, initialize, onboardingCompleted } = useAuthStore();
  const { theme } = useThemeStore();
  const {
    fetchAll,
    subscribeRealtime,
    unsubscribeRealtime,
    loadMockData,
    loading: dataLoading,
  } = useDataStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (user && merchant) {
      fetchAll(merchant.id);
      subscribeRealtime(merchant.id);
      return () => unsubscribeRealtime();
    } else if (!authLoading && !user) {
      loadMockData();
    }
  }, [user, merchant, authLoading, fetchAll, loadMockData, subscribeRealtime, unsubscribeRealtime]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        {/* Background Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ios-blue/10 rounded-full blur-[100px]" />
        
        <div className="text-center space-y-8 relative z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl"
          >
            <Bot className="w-12 h-12 text-white" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tighter">AutoAgent Core</h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-1 h-1 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1 h-1 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user && !isStarted) {
    return <LandingPage onEnter={() => setIsStarted(true)} />;
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
          <Auth />
        </ErrorBoundary>
      </Suspense>
    );
  }

  if (!onboardingCompleted) {
    return <OnboardingWizard />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'orders': return <Orders />;
      case 'agent': return <ChatAgent />;
      case 'agent-recovery': return <RecoveryAgent />;
      case 'image-analysis': return <Suspense fallback={<LoadingFallback />}><ImageAnalysis /></Suspense>;
      case 'forecasting': return <Suspense fallback={<LoadingFallback />}><Forecasting /></Suspense>;
      case 'connector': return <Suspense fallback={<LoadingFallback />}><Connector /></Suspense>;
      case 'agents': return <Suspense fallback={<LoadingFallback />}><AgentHub /></Suspense>;
      case 'activity-log': return <ActivityLog />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      <ErrorBoundary>
        <AnimatePresence mode="wait">
          {dataLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-ios-blue/10 border-t-ios-blue rounded-full animate-spin mx-auto" />
                  <Sparkles className="w-6 h-6 text-ios-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Store Data</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderView()}
            </motion.div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </Layout>
  );
};

export default App;
