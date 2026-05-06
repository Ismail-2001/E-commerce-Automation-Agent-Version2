import React, { useMemo } from 'react';
import {
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Package,
  Mail,
  MoreHorizontal,
  Bot,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDataStore } from '../stores/dataStore';
import { LoadingSpinner } from './StatusStates';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value }: { value: number }) => {
  const spring = useSpring(0, { mass: 1, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => `$${Math.round(current).toLocaleString()}`);
  
  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  
  return <motion.span>{display}</motion.span>;
};

const Dashboard: React.FC = () => {
  const { products, orders, carts, salesData, agentActivity, loading } = useDataStore();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const pendingOrders = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Shipped'
  ).length;
  const lowStockCount = products.filter((p) => p.stock < 10).length;
  const abandonedCarts = carts.filter((c) => c.status === 'abandoned');
  const recoveredCarts = carts.filter((c) => c.status === 'recovered');
  const recoveryRate = carts.length > 0 ? Math.round((recoveredCarts.length / carts.length) * 100) : 0;
  
  const stats = [
    {
      label: 'Revenue',
      value: totalRevenue,
      isCurrency: true,
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-ios-blue',
      bg: 'bg-ios-blue/10',
    },
    {
      label: 'Active Orders',
      value: pendingOrders,
      change: '+8.2%',
      trend: 'up' as const,
      icon: ShoppingBag,
      color: 'text-ios-green',
      bg: 'bg-ios-green/10',
    },
    {
      label: 'Low Stock',
      value: lowStockCount,
      change: `-${lowStockCount}`,
      trend: 'down' as const,
      icon: Package,
      color: 'text-ios-orange',
      bg: 'bg-ios-orange/10',
    },
    {
      label: 'Recovery',
      value: recoveryRate,
      isPercent: true,
      change: '+4.1%',
      trend: 'up' as const,
      icon: Activity,
      color: 'text-ios-indigo',
      bg: 'bg-ios-indigo/10',
    },
  ];

  const iconMap: Record<string, React.ElementType> = {
    Recovery: Mail,
    Inventory: Package,
    Orders: Users,
  };

  const colorMap: Record<string, string> = {
    Recovery: 'bg-ios-indigo/10 text-ios-indigo',
    Inventory: 'bg-ios-orange/10 text-ios-orange',
    Orders: 'bg-ios-purple/10 text-ios-purple',
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Dynamic Island Status Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">
            {greeting}, <br className="lg:hidden" /> <span className="text-ios-blue">Merchant.</span>
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Fleet Operational Control</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl border border-white/10 backdrop-blur-2xl"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-ios-green rounded-full animate-pulse shadow-[0_0_12px_rgba(48,209,88,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Active Core</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-ios-blue fill-ios-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest">1.4ms Latency</span>
          </div>
        </motion.div>
      </div>

      {/* Hero Intelligence Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-10 rounded-[2.5rem] bg-slate-900 dark:bg-zinc-900 overflow-hidden group shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
          <Bot className="w-80 h-80 -mr-20 -mt-20 text-ios-blue" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-ios-blue/20 rounded-2xl flex items-center justify-center border border-ios-blue/30">
              <Sparkles className="w-6 h-6 text-ios-blue" />
            </div>
            <div>
              <p className="text-ios-blue text-[10px] font-black uppercase tracking-[0.3em]">Neural Status: Optimal</p>
              <h3 className="text-white text-2xl font-black tracking-tight">System Autonomy Enabled</h3>
            </div>
          </div>

          <p className="text-zinc-400 text-xl font-medium max-w-2xl leading-relaxed">
            Autonomous agents have processed <span className="text-white font-black">{orders.length} events</span> today. 
            Revenue efficiency is currently <span className="text-ios-green font-black">+{recoveryRate}% above baseline</span>, 
            recovering <span className="text-white font-black">${(recoveredCarts.reduce((acc, c) => acc + c.totalValue, 0)).toLocaleString()}</span> in pending capital.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="ios-btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-ios-blue/20">
              Initialize Global Audit
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-xl">
              Performance Matrix
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className="ios-card group ios-card-hover !p-8"
          >
            <div className="flex justify-between items-start mb-8">
              <div className={`${stat.bg} p-4 rounded-2xl transition-transform group-hover:scale-110 border border-white/5`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-full ${stat.trend === 'up' ? 'bg-ios-green/10 text-ios-green' : 'bg-ios-red/10 text-ios-red'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" /> : <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />}
                {stat.change}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {stat.isCurrency && <AnimatedCounter value={stat.value as number} />}
                {!stat.isCurrency && stat.value}
                {stat.isPercent && '%'}
              </div>
              <div className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 ios-card !p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Revenue Dynamics</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Real-time Performance Vector</p>
            </div>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors border border-black/5 dark:border-white/5">
              <MoreHorizontal className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    padding: '16px',
                  }}
                  itemStyle={{ color: '#007AFF', fontWeight: 900, fontSize: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 900, marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#007AFF"
                  strokeWidth={5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          {/* Neural Proposals */}
          <div className="ios-card !bg-ios-blue/5 border-ios-blue/20 !p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-ios-blue" /> Intelligent Tasks
              </h3>
              <span className="bg-ios-blue text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-ios-blue/20">3</span>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Inventory Inbound', desc: 'Restock sequence identified for Lumina.', icon: Package, color: 'text-ios-orange' },
                { title: 'Revenue Recovery', desc: 'High-value draft ready for transmission.', icon: Mail, color: 'text-ios-purple' },
              ].map((task, i) => (
                <div key={i} className="p-5 bg-white dark:bg-zinc-800 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
                      <task.icon className={`w-5 h-5 ${task.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{task.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{task.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-ios-blue transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Activity Stream */}
          <div className="ios-card !p-8 flex flex-col h-[400px]">
            <h3 className="text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Activity className="w-4 h-4 text-ios-orange" />
              Intelligence Stream
            </h3>

            <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide">
              {agentActivity.slice(0, 8).map((item, i) => {
                const Icon = iconMap[item.agent_type] || Mail;
                const color = colorMap[item.agent_type] || 'bg-ios-blue/10 text-ios-blue';
                return (
                  <div key={i} className="flex gap-5 items-center group cursor-pointer">
                    <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border border-white/5 shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-ios-blue transition-colors">{item.message}</p>
                      <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.15em] mt-0.5">{item.agent_type} Agent</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
