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

type ActiveAgent = 'pricing' | 'supplier' | 'marketing' | 'overview';

const AgentHub: React.FC = () => {
  const { products, salesData, loading } = useDataStore();
  const [activeAgent, setActiveAgent] = useState<ActiveAgent>('overview');

  if (loading) return <LoadingSpinner message="Loading agent data..." />;
  if (products.length === 0)
    return (
      <EmptyState
        title="No products available"
        subtitle="Add products to activate your AI agents."
      />
    );

  const agents = [
    {
      id: 'pricing' as const,
      name: 'Pricing Agent',
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-600',
      desc: 'Dynamic price optimization',
    },
    {
      id: 'supplier' as const,
      name: 'Supplier Agent',
      icon: Truck,
      color: 'bg-blue-100 text-blue-600',
      desc: 'Vendor negotiations',
    },
    {
      id: 'marketing' as const,
      name: 'Marketing Agent',
      icon: Megaphone,
      color: 'bg-purple-100 text-purple-600',
      desc: 'Campaign generation',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="w-7 h-7 text-indigo-600" /> Multi-Agent Hub
        </h1>
        <p className="text-gray-500">
          Autonomous AI agents working together to optimize your store.
        </p>
      </div>

      {/* Agent Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeAgent === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(isActive ? 'overview' : agent.id)}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{agent.name}</h3>
                  <p className="text-xs text-gray-500">{agent.desc}</p>
                </div>
              </div>
              {isActive && (
                <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-medium">
                  <Zap className="w-3 h-3" /> Active
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Agent Content */}
      {activeAgent === 'overview' && <AgentOverview products={products} salesData={salesData} />}
      {activeAgent === 'pricing' && <PricingPanel products={products} salesData={salesData} />}
      {activeAgent === 'supplier' && <SupplierPanel products={products} />}
      {activeAgent === 'marketing' && <MarketingPanel products={products} />}
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-yellow-300" />
          <span className="text-sm font-medium uppercase tracking-wide text-indigo-100">
            Cross-Agent Intelligence Report
          </span>
        </div>
        <p className="text-lg leading-relaxed">
          Your agents have analyzed {products.length} products.{' '}
          <strong>{priceChanges} pricing adjustments</strong> are recommended,{' '}
          <strong>{urgentSupplier} supplier actions</strong> are urgent, and{' '}
          <strong>{highUrgencyCampaigns} marketing campaigns</strong> need immediate launch.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <SummaryCard
          icon={DollarSign}
          color="bg-emerald-100 text-emerald-600"
          title="Pricing Agent"
          metric={`${priceChanges} adjustments`}
          detail={`${pricing.filter((p) => p.strategy === 'increase').length} increases, ${pricing.filter((p) => p.strategy === 'decrease').length} decreases`}
          revenue={`${pricing.reduce((a, p) => a + p.estimatedRevenueImpact, 0) >= 0 ? '+' : ''}$${Math.abs(pricing.reduce((a, p) => a + p.estimatedRevenueImpact, 0)).toLocaleString()}/mo est.`}
        />
        <SummaryCard
          icon={Truck}
          color="bg-blue-100 text-blue-600"
          title="Supplier Agent"
          metric={`${urgentSupplier} urgent`}
          detail={`${supplier.filter((s) => s.action === 'reorder').length} reorders, ${supplier.filter((s) => s.action === 'negotiate').length} negotiations`}
          revenue={`$${supplier.reduce((a, s) => a + s.estimatedCost, 0).toLocaleString()} estimated cost`}
        />
        <SummaryCard
          icon={Megaphone}
          color="bg-purple-100 text-purple-600"
          title="Marketing Agent"
          metric={`${marketing.length} campaigns`}
          detail={`${highUrgencyCampaigns} high priority, ${marketing.filter((m) => m.campaignType === 'flash_sale').length} flash sales`}
          revenue={`${marketing.reduce((a, m) => a + m.suggestedChannels.length, 0)} channel placements`}
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
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-gray-900">{title}</h3>
    </div>
    <div className="text-2xl font-bold text-gray-900">{metric}</div>
    <p className="text-sm text-gray-500 mt-0.5">{detail}</p>
    <p className="text-xs text-indigo-600 font-medium mt-2">{revenue}</p>
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
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-emerald-600" /> Price Optimization Recommendations
      </h2>
      {recommendations.map((rec, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  rec.strategy === 'increase'
                    ? 'bg-green-100'
                    : rec.strategy === 'decrease'
                      ? 'bg-red-100'
                      : 'bg-gray-100'
                }`}
              >
                {rec.strategy === 'increase' ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : rec.strategy === 'decrease' ? (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                ) : (
                  <Minus className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{rec.productName}</h3>
                <p className="text-sm text-gray-500 mt-0.5 max-w-lg">{rec.reason}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-500">Current</div>
                <div className="text-lg font-bold text-gray-900">${rec.currentPrice}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300" />
              <div className="text-center">
                <div className="text-sm text-gray-500">Suggested</div>
                <div
                  className={`text-lg font-bold ${
                    rec.strategy === 'increase'
                      ? 'text-green-600'
                      : rec.strategy === 'decrease'
                        ? 'text-red-600'
                        : 'text-gray-900'
                  }`}
                >
                  ${rec.suggestedPrice}
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  rec.changePercent > 0
                    ? 'bg-green-50 text-green-700'
                    : rec.changePercent < 0
                      ? 'bg-red-50 text-red-700'
                      : 'bg-gray-50 text-gray-700'
                }`}
              >
                {rec.changePercent > 0 ? '+' : ''}
                {rec.changePercent}%
              </div>
            </div>
          </div>
        </div>
      ))}
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

  const urgencyColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-amber-100 text-amber-700 border-amber-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    low: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Truck className="w-5 h-5 text-blue-600" /> Supplier Action Items
      </h2>
      {recommendations.map((rec, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  rec.urgency === 'critical'
                    ? 'bg-red-100'
                    : rec.urgency === 'high'
                      ? 'bg-amber-100'
                      : 'bg-gray-100'
                }`}
              >
                {rec.urgency === 'critical' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <Package className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{rec.productName}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{rec.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${urgencyColors[rec.urgency]}`}
              >
                {rec.urgency}
              </span>
              {rec.action !== 'none' && (
                <button
                  onClick={() => handleGenerateEmail(rec)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  Draft Email
                </button>
              )}
            </div>
          </div>

          {expandedId === rec.productId && (
            <div className="border-t border-gray-100 p-5 bg-gray-50">
              {generating ? (
                <div className="flex items-center gap-2 text-indigo-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">AI generating vendor email...</span>
                </div>
              ) : emailContent ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm text-gray-700 whitespace-pre-line max-h-64 overflow-y-auto">
                    {emailContent}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">Tip: {rec.negotiationTip}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(emailContent);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ))}
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

  const campaignTypeColors: Record<string, string> = {
    flash_sale: 'bg-red-50 text-red-700',
    new_arrival: 'bg-blue-50 text-blue-700',
    seasonal: 'bg-indigo-50 text-indigo-700',
    clearance: 'bg-amber-50 text-amber-700',
    vip: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-purple-600" /> Campaign Briefs
      </h2>
      {campaigns.map((campaign, i) => {
        const product = products.find((p) => p.id === campaign.productId);
        const isExpanded = expandedId === campaign.productId;

        return (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div
              className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : campaign.productId)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${campaignTypeColors[campaign.campaignType]}`}
                    >
                      {campaign.campaignType.replace('_', ' ')}
                    </span>
                    {campaign.urgencyLevel === 'high' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                        URGENT
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900">{campaign.headline}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{campaign.productName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {campaign.suggestedChannels.slice(0, 3).map((ch, j) => (
                    <span
                      key={j}
                      className="px-2.5 py-1 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600"
                    >
                      {ch}
                    </span>
                  ))}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Ad Copy</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{campaign.adCopy}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">
                      Target Audience
                    </h4>
                    <p className="text-sm text-gray-700">{campaign.targetAudience}</p>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mt-3 mb-1">CTA</h4>
                    <span className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">
                      {campaign.ctaText}
                    </span>
                  </div>
                </div>

                {/* AI Copy Generator */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-sm font-bold text-gray-700">Generate AI Ad Copy for:</h4>
                    {['Instagram', 'Facebook', 'TikTok', 'Email'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPlatform(p)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedPlatform === p
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => product && handleGenerateCopy(product, selectedPlatform)}
                      disabled={generating}
                      className="ml-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      {generating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                      Generate
                    </button>
                  </div>

                  {aiCopy && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm text-gray-700 whitespace-pre-line">
                      {aiCopy}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AgentHub;
