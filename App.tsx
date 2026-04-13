import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import ChatAgent from './components/ChatAgent';
import RecoveryAgent from './components/RecoveryAgent';
import ImageAnalysis from './components/ImageAnalysis';
import Forecasting from './components/Forecasting';
import Connector from './components/Connector';
import AgentHub from './components/AgentHub';
import Auth from './components/Auth';
import { ViewState } from './types';
import { useAuthStore } from './stores/authStore';
import { useDataStore } from './stores/dataStore';
import { supabaseConfigured } from './lib/supabase';
import { Loader2, Bot } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const { user, merchant, loading: authLoading, initialize } = useAuthStore();
  const { fetchAll, subscribeRealtime, unsubscribeRealtime, loadMockData, loading: dataLoading } = useDataStore();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

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
  }, [user, merchant, authLoading]);

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

  // If Supabase is configured but user is not signed in, show auth screen
  if (supabaseConfigured && !user) {
    return <Auth />;
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
        return <ImageAnalysis />;
      case 'forecasting':
        return <Forecasting />;
      case 'connector':
        return <Connector />;
      case 'agents':
        return <AgentHub />;
      case 'settings':
        return <div className="p-10 text-center text-slate-500">Settings — Coming Soon</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {dataLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Loading store data...</p>
          </div>
        </div>
      ) : (
        renderView()
      )}
    </Layout>
  );
};

export default App;
