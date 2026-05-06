import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Package,
  Calendar,
  ShoppingBag,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDataStore } from '../stores/dataStore';
import { forecastAll, ForecastResult } from '../services/forecastingService';
import { LoadingSpinner, EmptyState } from './StatusStates';
import { motion, AnimatePresence } from 'framer-motion';

const Forecasting: React.FC = () => {
  const { products, salesData, loading } = useDataStore();

  const forecasts = useMemo(() => forecastAll(products, salesData), [products, salesData]);

  if (loading) return <LoadingSpinner message="Calculating projections..." />;
  if (products.length === 0)
    return (
      <EmptyState
        title="No Products to Forecast"
        subtitle="Initialize inventory data to see demand predictions."
      />
    );

  const urgentCount = forecasts.filter((f) => f.daysUntilStockout < 7).length;
  const risingCount = forecasts.filter((f) => f.trend === 'rising').length;
  const totalDailySales = Math.round(forecasts.reduce((a, f) => a + f.avgDailySales, 0));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Demand Intelligence</h1>
          <p className="text-slate-500 dark:text-zinc-400 font-medium">Predictive stock-out analysis and reorder logic.</p>
        </div>
        <div className="ios-glass px-5 py-3 rounded-2xl flex items-center gap-3 border border-black/5 dark:border-white/5 shadow-sm">
          <Activity className="w-5 h-5 text-ios-purple" />
          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Real-time Projections</span>
        </div>
      </div>

      {/* Summary Metrics - iOS Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ios-card group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-ios-red/10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <AlertTriangle className="w-6 h-6 text-ios-red" />
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{urgentCount}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Stock Critical Items</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ios-card group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-ios-green/10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <TrendingUp className="w-6 h-6 text-ios-green" />
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{risingCount}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Surging in Demand</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="ios-card group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-ios-blue/10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <BarChart3 className="w-6 h-6 text-ios-blue" />
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{totalDailySales}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Aggregated Daily Velocity</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Forecast Feed */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Portfolio Projections</h3>
        {forecasts.map((forecast, idx) => (
          <ForecastCard key={idx} forecast={forecast} idx={idx} />
        ))}
      </div>
    </div>
  );
};

const ForecastCard: React.FC<{ forecast: ForecastResult; idx: number }> = ({ forecast, idx }) => {
  const [expanded, setExpanded] = useState(false);

  const getUrgencyStyles = (days: number) => {
    if (days < 3) return { text: 'text-ios-red', bg: 'bg-ios-red/10', border: 'border-ios-red/20', icon: AlertTriangle };
    if (days < 7) return { text: 'text-ios-orange', bg: 'bg-ios-orange/10', border: 'border-ios-orange/20', icon: Activity };
    return { text: 'text-ios-green', bg: 'bg-ios-green/10', border: 'border-ios-green/20', icon: CheckCircle2 };
  };

  const status = getUrgencyStyles(forecast.daysUntilStockout);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`ios-card !p-0 overflow-hidden transition-all duration-300 ${expanded ? 'ring-2 ring-ios-blue/20 shadow-2xl' : 'ios-card-hover'}`}
    >
      <div
        className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${status.bg} ${status.text} shadow-sm`}>
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{forecast.productName}</h3>
            <div className="flex flex-wrap items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-widest">{forecast.avgDailySales} Velocity</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${forecast.trend === 'rising' ? 'text-ios-green border-ios-green/20 bg-ios-green/5' : 'text-slate-400 border-black/5 dark:border-white/10 bg-black/5'}`}>
                {forecast.trend === 'rising' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {forecast.trend}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-right">
            <div className={`text-2xl font-black tracking-tighter ${forecast.daysUntilStockout < 7 ? 'text-ios-red' : 'text-slate-900 dark:text-white'}`}>
              {forecast.daysUntilStockout >= 999 ? '999+' : forecast.daysUntilStockout} Days
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reserve Lifecycle</div>
          </div>
          
          <div className="text-right hidden sm:block border-l border-black/5 dark:border-white/5 pl-10">
            <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{forecast.currentStock}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory</div>
          </div>

          <div className={`p-2 rounded-xl transition-all ${expanded ? 'bg-ios-blue text-white rotate-180' : 'bg-black/5 text-slate-400'}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]"
          >
            <div className="p-8 grid lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-ios-blue" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autonomous Strategy</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5">
                    <span className="text-sm font-bold text-slate-500">Target Reorder Date</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{forecast.recommendedReorderDate}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5">
                    <span className="text-sm font-bold text-slate-500">Unit Order Payload</span>
                    <span className="text-sm font-black text-ios-blue uppercase tracking-widest">{forecast.recommendedOrderQty} Standard Units</span>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5">
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-bold text-slate-500">Predictive Confidence</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{forecast.confidence}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${forecast.confidence}%` }}
                        className={`h-full rounded-full ${forecast.confidence > 70 ? 'bg-ios-green' : forecast.confidence > 40 ? 'bg-ios-orange' : 'bg-ios-red shadow-[0_0_12px_rgba(255,59,48,0.5)]'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-4 h-4 text-ios-purple" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">7-Day Demand Curve</h4>
                </div>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecast.weeklyForecast}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        contentStyle={{
                          borderRadius: '16px',
                          border: 'none',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(8px)',
                        }}
                      />
                      <Bar dataKey="predicted" radius={[6, 6, 0, 0]}>
                        {forecast.weeklyForecast.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#007AFF' : '#E5E7EB'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Forecasting;

const CheckCircle2: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);
