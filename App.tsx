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
import { supabaseConfigured } from './lib/supabase';
import { Loader2, Bot } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import OnboardingWizard from './components/OnboardingWizard';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import ActivityLog from './components/ActivityLog';

// Lazy-loaded heavy components (code-splitting)
const ImageAnalysis = lazy(() => import('./components/ImageAnalysis'));
const Forecasting = lazy(() => import('./components/Forecasting'));
const Connector = lazy(() => import('./components/Connector'));
const AgentHub = lazy(() => import('./components/AgentHub'));
const Auth = lazy(() => import('./components/Auth'));

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center space-y-3">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
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

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Sync dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // When authenticated with a merchant, fetch live data + subscribe to realtime
  useEffect(() => {
    if (user && merchant) {
      fetchAll(merchant.id);
      subscribeRealtime(merchant.id);
      return () => unsubscribeRealtime();
    } else if (!authLoading && !user) {
      // No auth — load mock data so the demo still works if Supabase isn't configured
      loadMockData();
    }
  }, [user, merchant, authLoading, fetchAll, loadMockData, subscribeRealtime, unsubscribeRealtime]);

  // Show loading spinner during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading AutoAgent...</p>
        </div>
      </div>
    );
  }

  // If user is unauthenticated and hasn't explicitly entered the app, show Public Landing Page
  if (!user && !isStarted) {
    return <LandingPage onEnter={() => setIsStarted(true)} />;
  }

  // If user is not signed in and has started the app via landing page, show Auth screen
  if (!user) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
          <Auth />
        </ErrorBoundary>
      </Suspense>
    );
  }

  // Show Onboarding for authenticated users who haven't completed it
  // Skip if we are running in non-supabase (mock) mode because onboarding 
  // uses the state for "getting started".
  if (!onboardingCompleted) {
    return <OnboardingWizard />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'orders':
        return <Orders />;
      case 'agent':
        return <ChatAgent />;
      case 'agent-recovery':
        return <RecoveryAgent />;
      case 'image-analysis':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ImageAnalysis />
          </Suspense>
        );
      case 'forecasting':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Forecasting />
          </Suspense>
        );
      case 'connector':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Connector />
          </Suspense>
        );
      case 'agents':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AgentHub />
          </Suspense>
        );
      case 'activity-log':
        return <ActivityLog />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      <ErrorBoundary>
        {dataLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm text-gray-500">Loading store data...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        )}
      </ErrorBoundary>
    </Layout>
  );
};

export default App;
