import React, { useState } from 'react';
import { ShoppingBag, Search, ClipboardCheck, Truck, RotateCcw, Star, X, Check, Copy, Zap, RefreshCw } from 'lucide-react';
import { Order } from '../types';
import { analyzeOrder, generateOrderActionContent, OrderInsight } from '../services/orderAgent';
import { useDataStore } from '../stores/dataStore';

const Orders: React.FC = () => {
  const { orders } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [aiInsight, setAiInsight] = useState<OrderInsight | null>(null);
  const [actionContent, setActionContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAnalyze = async (order: Order) => {
    setSelectedOrder(order);
    setLoading(true);
    setActionContent('');

    const insight = await analyzeOrder(order);
    setAiInsight(insight);
    setLoading(false);
  };

  const handleExecuteAction = async () => {
    if (!selectedOrder || !aiInsight) return;

    setGenerating(true);
    const content = await generateOrderActionContent(selectedOrder, aiInsight.type);
    setActionContent(content);
    setGenerating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Returned': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Shipped': return <Truck className="w-4 h-4" />;
      case 'Delivered': return <ClipboardCheck className="w-4 h-4" />;
      case 'Pending': return <RefreshCw className="w-4 h-4" />;
      case 'Returned': return <RotateCcw className="w-4 h-4" />;
      default: return <ShoppingBag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Order Processor</h1>
          <p className="text-gray-500">AI-powered fulfillment and customer service.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              onClick={() => handleAnalyze(order)}
              className={`bg-white p-5 rounded-xl border border-gray-200 cursor-pointer hover:shadow-md transition-all flex items-center gap-4 group
                ${selectedOrder?.id === order.id ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(order.status)} bg-opacity-20`}>
                {getStatusIcon(order.status)}
              </div>

              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{order.customerName}</h3>
                  <span className="font-bold text-gray-900">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{order.id} • {order.items} items</span>
                  <span>{order.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg h-[600px] flex flex-col sticky top-6">
            {!selectedOrder ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <ShoppingBag className="w-16 h-16 mb-4 text-indigo-100" />
                <p className="font-medium">Select an order to analyze</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50 rounded-t-xl">
                  <div>
                    <h2 className="font-bold text-gray-900">Order Analysis</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  {loading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                      <span className="text-sm font-medium text-gray-500 animate-pulse">Analyzing customer history...</span>
                    </div>
                  ) : aiInsight ? (
                    <div className="space-y-6">
                      <div className={`p-4 rounded-xl border-l-4 ${aiInsight.type === 'return_risk' ? 'bg-rose-50 border-rose-500' :
                          aiInsight.type === 'vip' ? 'bg-purple-50 border-purple-500' :
                            aiInsight.type === 'pending' ? 'bg-amber-50 border-amber-500' :
                              'bg-green-50 border-green-500'}`}>
                        <div className="flex items-start gap-3">
                          {aiInsight.type === 'vip' && <Star className="w-5 h-5 text-purple-600 mt-0.5" />}
                          {aiInsight.type === 'return_risk' && <RotateCcw className="w-5 h-5 text-rose-600 mt-0.5" />}
                          {aiInsight.type === 'ok' && <Check className="w-5 h-5 text-green-600 mt-0.5" />}
                          <div>
                            <h3 className="text-sm font-bold uppercase tracking-wide mb-1 text-gray-800">
                              {aiInsight.type.split('_').join(' ')}
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{aiInsight.message}</p>
                          </div>
                        </div>
                      </div>

                      {aiInsight.type !== 'ok' && (
                        <div className="space-y-3">
                          <button
                            onClick={handleExecuteAction}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-indigo-200 shadow-lg"
                            disabled={generating}
                          >
                            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                            {generating ? 'Generating Draft...' : aiInsight.action}
                          </button>

                          {actionContent && (
                            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-sm text-slate-700 whitespace-pre-line max-h-48 overflow-y-auto">
                                {actionContent}
                              </div>
                              <div className="flex justify-end mt-2">
                                <button className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600">
                                  <Copy className="w-3 h-3" /> Copy to Clipboard
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
