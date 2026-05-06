import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Mail, 
  Tag, 
  PackageSearch, 
  TrendingUp, 
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

type AgentType = 'recovery' | 'inventory' | 'pricing' | 'support' | 'analytics';
type ActionStatus = 'success' | 'pending' | 'failed';

interface LogEntry {
  id: string;
  agent: AgentType;
  action: string;
  target: string;
  impact?: string;
  status: ActionStatus;
  timestamp: string;
  details?: string;
  dateGroup: 'Today' | 'Yesterday' | 'Previous';
}

const mockLogs: LogEntry[] = [
  {
    id: 'log-1',
    agent: 'recovery',
    action: 'Sent 2nd notice email',
    target: 'Cart #8982 (john.d@example.com)',
    impact: '+$145.00 Potential',
    status: 'success',
    timestamp: '09:42 AM',
    dateGroup: 'Today',
    details: 'Customer abandoned Premium Headphones 24h ago. Email opened.'
  },
  {
    id: 'log-2',
    agent: 'pricing',
    action: 'Adjusted price (+5%)',
    target: 'Wireless Earbuds Pro',
    impact: '+$12.50 / unit',
    status: 'success',
    timestamp: '08:15 AM',
    dateGroup: 'Today',
    details: 'Competitor out of stock. Automatically increased price to capture maximum margin.'
  },
  {
    id: 'log-3',
    agent: 'inventory',
    action: 'Drafted reorder request',
    target: 'Smart Watch Series 5',
    status: 'pending',
    timestamp: '06:30 AM',
    dateGroup: 'Today',
    details: 'Velocity increased by 40% this week. Expecting stockout in 6 days.'
  },
  {
    id: 'log-4',
    agent: 'support',
    action: 'Resolved customer query',
    target: 'Ticket #4491 (Shipping)',
    status: 'success',
    timestamp: '11:20 PM',
    dateGroup: 'Yesterday',
    details: 'AI analyzed query and successfully provided tracking details automatically.'
  },
  {
    id: 'log-5',
    agent: 'analytics',
    action: 'Generated ROI Report',
    target: 'Weekly Executive Summary',
    status: 'success',
    timestamp: '04:10 PM',
    dateGroup: 'Yesterday'
  },
  {
    id: 'log-6',
    agent: 'recovery',
    action: 'Attempted WhatsApp message',
    target: 'Cart #8970',
    status: 'failed',
    timestamp: '02:05 PM',
    dateGroup: 'Yesterday',
    details: 'Invalid phone number format provided at checkout.'
  }
];

const AgentConfig = {
  recovery: { icon: Mail, label: 'Recovery', color: 'bg-ios-blue', iconColor: 'text-ios-blue' },
  inventory: { icon: PackageSearch, label: 'Inventory', color: 'bg-ios-orange', iconColor: 'text-ios-orange' },
  pricing: { icon: Tag, label: 'Pricing', color: 'bg-ios-green', iconColor: 'text-ios-green' },
  support: { icon: MessageSquare, label: 'Support', color: 'bg-ios-purple', iconColor: 'text-ios-purple' },
  analytics: { icon: TrendingUp, label: 'Analytics', color: 'bg-ios-indigo', iconColor: 'text-ios-indigo' }
};

const StatusIcon = ({ status }: { status: ActionStatus }) => {
  switch (status) {
    case 'success': return <div className="w-2 h-2 rounded-full bg-ios-green" />;
    case 'pending': return <div className="w-2 h-2 rounded-full bg-ios-orange animate-pulse" />;
    case 'failed': return <div className="w-2 h-2 rounded-full bg-ios-red" />;
  }
};

const ActivityLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState<AgentType | 'all'>('all');

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgent = filterAgent === 'all' || log.agent === filterAgent;
    return matchesSearch && matchesAgent;
  });

  const groups: ('Today' | 'Yesterday' | 'Previous')[] = ['Today', 'Yesterday', 'Previous'];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-glow">System Audit</h1>
          <p className="text-slate-500 dark:text-zinc-400 font-medium">Immutable stream of autonomous agent operations.</p>
        </div>
        <div className="ios-glass px-5 py-3 rounded-2xl flex items-center gap-3 border border-black/5 dark:border-white/5 shadow-sm">
          <Shield className="w-5 h-5 text-ios-green" />
          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Encrypted Log Stream</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 px-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search decisions or targets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 ios-glass border-none rounded-[1.5rem] text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-ios-blue transition-all"
          />
        </div>
        <div className="ios-glass px-4 py-1.5 rounded-[1.5rem] flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value as any)}
            className="bg-transparent border-none text-sm font-bold text-slate-600 dark:text-zinc-300 focus:ring-0 cursor-pointer pr-8"
          >
            <option value="all">All Channels</option>
            {Object.keys(AgentConfig).map(type => (
              <option key={type} value={type}>{AgentConfig[type as AgentType].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-10">
        {groups.map(group => {
          const groupLogs = filteredLogs.filter(l => l.dateGroup === group);
          if (groupLogs.length === 0) return null;

          return (
            <div key={group} className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">{group}</h3>
              <div className="ios-card !p-0 overflow-hidden divide-y divide-black/5 dark:divide-white/5 shadow-xl">
                {groupLogs.map((log, i) => (
                  <LogItem key={log.id} log={log} i={i} />
                ))}
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="ios-card py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-slate-300">
              <Activity className="w-8 h-8" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching activities found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LogItem: React.FC<{ log: LogEntry; i: number }> = ({ log, i }) => {
  const [expanded, setExpanded] = useState(false);
  const config = AgentConfig[log.agent];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.03 }}
      className={`group transition-all duration-300 ${expanded ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
    >
      <div 
        className="p-5 flex items-center gap-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.color} text-white shadow-lg shadow-black/5`}>
          <config.icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <StatusIcon status={log.status} />
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">{log.action}</span>
            {log.impact && (
              <span className="px-2 py-0.5 rounded-full bg-ios-green/10 text-ios-green text-[9px] font-black uppercase tracking-widest border border-ios-green/20">
                {log.impact}
              </span>
            )}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 truncate">{log.target}</div>
        </div>

        <div className="flex items-center gap-4 pl-4 border-l border-black/5 dark:border-white/5 text-right shrink-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.timestamp}</span>
          <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${expanded ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-1 flex gap-5">
              <div className="w-12 shrink-0 flex flex-col items-center">
                <div className="w-0.5 h-full bg-gradient-to-b from-black/5 via-black/5 to-transparent dark:from-white/5 dark:via-white/5" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 shadow-inner">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-ios-blue" /> Execution Logic
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 leading-relaxed italic">
                    &quot;{log.details || 'Standard autonomous sequence executed without anomalies.'}&quot;
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 ios-glass rounded-xl text-center">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Payload ID</div>
                    <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-zinc-400 truncate">#TX-{log.id.slice(-4).toUpperCase()}</div>
                  </div>
                  <div className="p-3 ios-glass rounded-xl text-center">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Channel</div>
                    <div className="text-[10px] font-bold text-slate-600 dark:text-zinc-400">{config.label} AI</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ActivityLog;
