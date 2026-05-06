import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Truck,
  Megaphone,
  Bot,
  Loader2,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Package,
  ChevronRight,
} from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { analyzePricing } from '../services/pricingAgent';
import {
  analyzeSupplierNeeds,
  generateNegotiationEmail,
  SupplierRecommendation,
} from '../services/supplierAgent';
import { generateCampaignBriefs, generateAICopy } from '../services/marketingAgent';
import type { Product, SalesData } from '../types';
import { rateLimiter } from '../lib/rateLimiter';
import { LoadingSpinner, EmptyState, ErrorBanner } from './StatusStates';
import { motion, AnimatePresence } from 'framer-motion';

type ActiveAgent = 'pricing' | 'supplier' | 'marketing' | 'overview';

const AgentHub: React.FC = () => {
  const { products, salesData, loading } = useDataStore();
  const [activeAgent, setActiveAgent] = useState<ActiveAgent>('overview');

  if (loading) return <LoadingSpinner message="Synchronizing agents..." />;
  if (products.length === 0)
    return (
      <EmptyState
        title="No items found"
        subtitle="Add products to initialize your autonomous agents."
      />
    );

  const agents = [
    {
      id: 'pricing' as const,
      name: 'Pricing',
      icon: DollarSign,
      color: 'ios-green',
      desc: 'Profit Optimization',
    },
    {
      id: 'supplier' as const,
      name: 'Logistics',
      icon: Truck,
      color: 'ios-blue',
      desc: 'Supply Management',
    },
    {
      id: 'marketing' as const,
      name: 'Creative',
      icon: Megaphone,
      color: 'ios-purple',
      desc: 'Growth Engine',
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Intelligence <span className="text-ios-pink">Hub</span></h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Multi-Agent Command Center</p>
        </div>
        <div className="ios-glass p-1 rounded-2xl flex gap-1 border border-black/5 dark:border-white/5 shadow-sm">
          <button 
            onClick={() => setActiveAgent('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeAgent === 'overview' ? 'bg-white dark:bg-zinc-800 text-ios-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Overview
          </button>
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeAgent === agent.id ? 'bg-white dark:bg-zinc-800 text-ios-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAgent}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeAgent === 'overview' && <AgentOverview products={products} salesData={salesData} />}
          {activeAgent === 'pricing' && <PricingPanel products={products} salesData={salesData} />}
          {activeAgent === 'supplier' && <SupplierPanel products={products} />}
          {activeAgent === 'marketing' && <MarketingPanel products={products} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ============================================
// OVERVIEW — Cross-Agent Collaboration Summary
// ============================================
const AgentOverview: React.FC<{ products: Product[]; salesData: SalesData[] }> = ({
  products,
  salesData,
}) => {
  const pricing = useMemo(() => analyzePricing(products, salesData), [products, salesData]);
  const supplier = useMemo(() => analyzeSupplierNeeds(products), [products]);
  const marketing = useMemo(() => generateCampaignBriefs(products), [products]);

  const priceChanges = pricing.filter((p) => p.strategy !== 'hold').length;
  const urgentSupplier = supplier.filter(
    (s) => s.urgency === 'critical' || s.urgency === 'high'
  ).length;
  const highUrgencyCampaigns = marketing.filter((m) => m.urgencyLevel === 'high').length;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-ios-blue to-ios-indigo p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Autonomous Agency Report</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight max-w-2xl">
            Your agents recommend <span className="text-ios-green font-black">{priceChanges} price shifts</span>, detected <span className="text-ios-red font-black">{urgentSupplier} critical logistical needs</span>, and prepared {marketing.length} growth campaigns.
          </h2>
          <div className="mt-8 flex gap-4">
            <button className="px-6 py-3 bg-white text-ios-blue rounded-2xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all">
              Execute Recommendations
            </button>
            <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold text-sm hover:bg-white/30 transition-all">
              Download Audit
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <SummaryCard
          icon={DollarSign}
          color="ios-green"
          title="Pricing Logic"
          metric={`${priceChanges} Recommendations`}
          detail={`${pricing.filter((p) => p.strategy === 'increase').length} Increases • ${pricing.filter((p) => p.strategy === 'decrease').length} Decreases`}
          revenue={`$${Math.abs(pricing.reduce((a, p) => a + p.estimatedRevenueImpact, 0)).toLocaleString()} Value Impact`}
        />
        <SummaryCard
          icon={Truck}
          color="ios-blue"
          title="Logistics Intelligence"
          metric={`${urgentSupplier} Urgent Actions`}
          detail={`${supplier.filter((s) => s.action === 'reorder').length} Pending Reorders • ${supplier.filter((s) => s.action === 'negotiate').length} Negotiations`}
          revenue={`$${supplier.reduce((a, s) => a + s.estimatedCost, 0).toLocaleString()} Capital Required`}
        />
        <SummaryCard
          icon={Megaphone}
          color="ios-purple"
          title="Growth Agency"
          metric={`${marketing.length} Live Campaigns`}
          detail={`${highUrgencyCampaigns} High Priority • ${marketing.filter((m) => m.campaignType === 'flash_sale').length} Active Promotions`}
          revenue={`${marketing.reduce((a, m) => a + m.suggestedChannels.length, 0)} Channel Placements`}
        />
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{
  icon: React.ElementType;
  color: string;
  title: string;
  metric: string;
  detail: string;
  revenue: string;
}> = ({ icon: Icon, color, title, metric, detail, revenue }) => (
  <div className="ios-card ios-card-hover p-6 group">
    <div className="flex items-center gap-4 mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}/10 text-${color} shadow-sm transition-transform group-hover:scale-110`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h3>
    </div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{metric}</div>
    <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-2">{detail}</p>
    <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-${color}`}>
      <Zap className="w-3.5 h-3.5" />
      {revenue}
    </div>
  </div>
);

// ============================================
// PRICING AGENT PANEL
// ============================================
const PricingPanel: React.FC<{ products: Product[]; salesData: SalesData[] }> = ({
  products,
  salesData,
}) => {
  const recommendations = useMemo(() => analyzePricing(products, salesData), [products, salesData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Optimization Matrix</h2>
        <div className="text-[10px] font-black text-ios-green uppercase tracking-widest bg-ios-green/10 px-3 py-1 rounded-full">Live Optimization Active</div>
      </div>
      <div className="grid gap-4">
        {recommendations.map((rec, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={i} 
            className="ios-card ios-card-hover p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-5 flex-1">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                  rec.strategy === 'increase'
                    ? 'bg-ios-green/10 text-ios-green'
                    : rec.strategy === 'decrease'
                      ? 'bg-ios-red/10 text-ios-red'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {rec.strategy === 'increase' ? (
                  <TrendingUp className="w-7 h-7" />
                ) : rec.strategy === 'decrease' ? (
                  <TrendingDown className="w-7 h-7" />
                ) : (
                  <Minus className="w-7 h-7" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{rec.productName}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{rec.reason}</p>
              </div>
            </div>

            <div className="flex items-center gap-8 px-4 py-3 bg-slate-50 dark:bg-zinc-900 rounded-[1.5rem] border border-black/5 dark:border-white/5">
              <div className="text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">${rec.currentPrice}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
              <div className="text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target</div>
                <div
                  className={`text-lg font-black ${
                    rec.strategy === 'increase'
                      ? 'text-ios-green'
                      : rec.strategy === 'decrease'
                        ? 'text-ios-red'
                        : 'text-slate-900 dark:text-white'
                  }`}
                >
                  ${rec.suggestedPrice}
                </div>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  rec.changePercent > 0
                    ? 'bg-ios-green/10 text-ios-green'
                    : rec.changePercent < 0
                      ? 'bg-ios-red/10 text-ios-red'
                      : 'bg-slate-200 text-slate-600'
                }`}
              >
                {rec.changePercent > 0 ? '+' : ''}{rec.changePercent}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// SUPPLIER AGENT PANEL
// ============================================
const SupplierPanel: React.FC<{ products: Product[] }> = ({ products }) => {
  const recommendations = useMemo(() => analyzeSupplierNeeds(products), [products]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateEmail = async (rec: SupplierRecommendation) => {
    if (!rateLimiter.canCall('supplier')) return;

    setExpandedId(rec.productId);
    setGenerating(true);
    setEmailContent('');
    setError(null);
    try {
      const email = await generateNegotiationEmail(rec);
      setEmailContent(email);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate email.');
    } finally {
      setGenerating(false);
    }
  };

  const urgencyStyles: Record<string, string> = {
    critical: 'bg-ios-red/10 text-ios-red',
    high: 'bg-ios-orange/10 text-ios-orange',
    medium: 'bg-ios-blue/10 text-ios-blue',
    low: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Logistics Pipeline</h2>
        <div className="text-[10px] font-black text-ios-blue uppercase tracking-widest bg-ios-blue/10 px-3 py-1 rounded-full">Autonomous Sourcing Active</div>
      </div>
      <div className="grid gap-4">
        {recommendations.map((rec, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={i}
            className="ios-card !p-0 overflow-hidden"
          >
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    rec.urgency === 'critical' ? 'bg-ios-red/10' : 'bg-slate-100'
                  }`}
                >
                  {rec.urgency === 'critical' ? (
                    <AlertTriangle className="w-7 h-7 text-ios-red" />
                  ) : (
                    <Package className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{rec.productName}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{rec.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${urgencyStyles[rec.urgency]}`}>
                  {rec.urgency} Urgency
                </span>
                {rec.action !== 'none' && (
                  <button
                    onClick={() => handleGenerateEmail(rec)}
                    className="ios-btn-primary px-6 py-2.5 text-xs"
                  >
                    Draft Terms
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {expandedId === rec.productId && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="ios-glass border-t border-black/5 dark:border-white/5 p-6">
                  {generating ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <Loader2 className="w-8 h-8 text-ios-blue animate-spin" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synthesizing Vendor Communication...</span>
                    </div>
                  ) : emailContent ? (
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-6 border border-black/5 dark:border-white/5 shadow-inner text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-line max-h-80 overflow-y-auto leading-relaxed font-medium">
                        {emailContent}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-ios-orange">
                          <Zap className="w-4 h-4" />
                          <span className="text-xs font-bold">Pro Tip: {rec.negotiationTip}</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(emailContent);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex items-center gap-2 text-ios-blue font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-all"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copied to Clipboard' : 'Copy Draft'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MARKETING AGENT PANEL
// ============================================
const MarketingPanel: React.FC<{ products: Product[] }> = ({ products }) => {
  const campaigns = useMemo(() => generateCampaignBriefs(products), [products]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiCopy, setAiCopy] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('Instagram');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCopy = async (product: Product, platform: string) => {
    if (!rateLimiter.canCall('marketing')) return;

    setGenerating(true);
    setAiCopy('');
    setError(null);
    try {
      const copy = await generateAICopy(product, platform);
      setAiCopy(copy);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate copy.');
    } finally {
      setGenerating(false);
    }
  };

  const campaignTypeStyles: Record<string, string> = {
    flash_sale: 'bg-ios-red/10 text-ios-red',
    new_arrival: 'bg-ios-blue/10 text-ios-blue',
    seasonal: 'bg-ios-indigo/10 text-ios-indigo',
    clearance: 'bg-ios-orange/10 text-ios-orange',
    vip: 'bg-ios-purple/10 text-ios-purple',
  };

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Campaign Intelligence</h2>
        <div className="text-[10px] font-black text-ios-purple uppercase tracking-widest bg-ios-purple/10 px-3 py-1 rounded-full">Creative Engine Ready</div>
      </div>
      <div className="grid gap-4">
        {campaigns.map((campaign, i) => {
          const product = products.find((p) => p.id === campaign.productId);
          const isExpanded = expandedId === campaign.productId;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={i}
              className="ios-card !p-0 overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : campaign.productId)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${campaignTypeStyles[campaign.campaignType]}`}>
                        {campaign.campaignType.replace('_', ' ')}
                      </span>
                      {campaign.urgencyLevel === 'high' && (
                        <span className="animate-pulse px-3 py-1 rounded-full text-[10px] font-black bg-ios-red text-white uppercase tracking-widest">
                          High Urgency
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">{campaign.headline}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{campaign.productName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {campaign.suggestedChannels.map((ch, j) => (
                        <div key={j} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-900 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                          {ch.slice(0, 2)}
                        </div>
                      ))}
                    </div>
                    <div className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-slate-300">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="ios-glass border-t border-black/5 dark:border-white/5 p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Creative Brief</h4>
                        <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5">{campaign.adCopy}</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Target Audience</h4>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{campaign.targetAudience}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Primary Action</h4>
                          <button className="ios-btn-primary px-8 py-3 text-xs w-full">
                            {campaign.ctaText}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-black/5 dark:border-white/5 pt-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-4">Platform Engine</h4>
                          {['Instagram', 'Facebook', 'TikTok', 'Email'].map((p) => (
                            <button
                              key={p}
                              onClick={() => setSelectedPlatform(p)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                selectedPlatform === p
                                  ? 'bg-ios-blue text-white shadow-lg'
                                  : 'bg-black/5 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => product && handleGenerateCopy(product, selectedPlatform)}
                          disabled={generating}
                          className="ios-btn-primary px-6 py-2.5 text-xs"
                        >
                          {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                          {generating ? 'Processing...' : 'Synthesize Copy'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {aiCopy && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-6 border border-black/5 dark:border-white/5 shadow-inner leading-relaxed text-sm text-slate-700 dark:text-zinc-300 font-medium">
                            {aiCopy}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentHub;
;
