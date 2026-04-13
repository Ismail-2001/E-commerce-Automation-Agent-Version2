import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Package, Calendar, ShoppingBag, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDataStore } from '../stores/dataStore';
import { forecastAll, ForecastResult } from '../services/forecastingService';

const Forecasting: React.FC = () => {
  const { products, salesData } = useDataStore();

  const forecasts = useMemo(() => forecastAll(products, salesData), [products, salesData]);

  const urgentCount = forecasts.filter(f => f.daysUntilStockout < 7).length;
  const risingCount = forecasts.filter(f => f.trend === 'rising').length;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'bg-green-50 text-green-700 border-green-200';
      case 'declining': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyColor = (days: number) => {
    if (days < 3) return 'text-red-600 bg-red-50';
    if (days < 7) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demand Forecasting</h1>
        <p className="text-gray-500">AI-powered stock predictions based on sales velocity trends.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{urgentCount}</div>
            <div className="text-sm text-gray-500">Need reorder this week</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{risingCount}</div>
            <div className="text-sm text-gray-500">Products with rising demand</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(forecasts.reduce((a, f) => a + f.avgDailySales, 0))}
            </div>
            <div className="text-sm text-gray-500">Avg daily units across all</div>
          </div>
        </div>
      </div>

      {/* Forecast Cards */}
      <div className="space-y-4">
        {forecasts.map((forecast, i) => (
          <ForecastCard key={i} forecast={forecast} getTrendIcon={getTrendIcon} getTrendColor={getTrendColor} getUrgencyColor={getUrgencyColor} />
        ))}
      </div>
    </div>
  );
};

const ForecastCard: React.FC<{
  forecast: ForecastResult;
  getTrendIcon: (t: string) => React.ReactNode;
  getTrendColor: (t: string) => string;
  getUrgencyColor: (d: number) => string;
}> = ({ forecast, getTrendIcon, getTrendColor, getUrgencyColor }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div
        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getUrgencyColor(forecast.daysUntilStockout)}`}>
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{forecast.productName}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                {forecast.avgDailySales} units/day
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTrendColor(forecast.trend)}`}>
                {getTrendIcon(forecast.trend)}
                {forecast.trend}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className={`text-lg font-bold ${forecast.daysUntilStockout < 7 ? 'text-red-600' : 'text-gray-900'}`}>
              {forecast.daysUntilStockout >= 999 ? '999+' : forecast.daysUntilStockout} days
            </div>
            <div className="text-xs text-gray-500">until stockout</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{forecast.currentStock}</div>
            <div className="text-xs text-gray-500">in stock</div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-indigo-600">{forecast.confidence}%</div>
            <div className="text-xs text-gray-500">confidence</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/50">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recommendation */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Recommendation</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Reorder by</span>
                  <span className="font-semibold text-gray-900">{forecast.recommendedReorderDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Order quantity</span>
                  <span className="font-semibold text-gray-900">{forecast.recommendedOrderQty} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${forecast.confidence > 70 ? 'bg-green-500' : forecast.confidence > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${forecast.confidence}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900 text-xs">{forecast.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Chart */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">7-Day Forecast</h4>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecast.weeklyForecast}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="predicted" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecasting;
