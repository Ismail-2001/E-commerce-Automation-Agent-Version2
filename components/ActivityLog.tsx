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
  AlertCircle
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
}

const mockLogs: LogEntry[] = [
  {
    id: 'log-1',
    agent: 'recovery',
    action: 'Sent 2nd notice email',
    target: 'Cart #8982 (john.d@example.com)',
    impact: '+$145.00 Potential',
    status: 'success',
    timestamp: '2 mins ago',
    details: 'Customer abandoned Premium Headphones 24h ago. Email opened.'
  },
  {
    id: 'log-2',
    agent: 'pricing',
    action: 'Adjusted price (+5%)',
    target: 'Wireless Earbuds Pro',
    impact: '+$12.50 / unit',
    status: 'success',
    timestamp: '15 mins ago',
    details: 'Competitor out of stock. Automatically increased price to capture maximum margin.'
  },
  {
    id: 'log-3',
    agent: 'inventory',
    action: 'Drafted reorder request',
    target: 'Smart Watch Series 5',
    status: 'pending',
    timestamp: '1 hour ago',
    details: 'Velocity increased by 40% this week. Expecting stockout in 6 days.'
  },
  {
    id: 'log-4',
    agent: 'support',
    action: 'Resolved customer query',
    target: 'Ticket #4491 (Shipping)',
    status: 'success',
    timestamp: '3 hours ago',
    details: 'AI analyzed query and successfully provided tracking details automatically.'
  },
  {
    id: 'log-5',
    agent: 'analytics',
    action: 'Generated ROI Report',
    target: 'Weekly Executive Summary',
    status: 'success',
    timestamp: '5 hours ago'
  },
  {
    id: 'log-6',
    agent: 'recovery',
    action: 'Attempted WhatsApp message',
    target: 'Cart #8970',
    status: 'failed',
    timestamp: 'Yesterday',
    details: 'Invalid phone number format provided at checkout.'
  }
];

const AgentConfig = {
  recovery: { icon: Mail, label: 'Recovery Agent', color: 'bg-blue-500/10 text-blue-500', border: 'border-blue-500/20' },
  inventory: { icon: PackageSearch, label: 'Inventory AI', color: 'bg-amber-500/10 text-amber-500', border: 'border-amber-500/20' },
  pricing: { icon: Tag, label: 'Pricing Engine', color: 'bg-emerald-500/10 text-emerald-500', border: 'border-emerald-500/20' },
  support: { icon: MessageSquare, label: 'Support AI', color: 'bg-purple-500/10 text-purple-500', border: 'border-purple-500/20' },
  analytics: { icon: TrendingUp, label: 'Data Analyst', color: 'bg-indigo-500/10 text-indigo-500', border: 'border-indigo-500/20' }
};

const StatusIcon = ({ status }: { status: ActionStatus }) => {
  switch (status) {
    case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
    case 'failed': return <AlertCircle className="w-4 h-4 text-rose-500" />;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            Agent Activity Log
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time audit trail of all AI decisions and actions.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <div className="relative">
            <select 
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value as any)}
              className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="all">All Agents</option>
              <option value="recovery">Recovery</option>
              <option value="pricing">Pricing</option>
              <option value="inventory">Inventory</option>
              <option value="support">Support</option>
            </select>
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action & Target</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Impact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredLogs.map((log, i) => {
                  const agentInfo = AgentConfig[log.agent];
                  const Icon = agentInfo.icon;
                  
                  return (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border ${agentInfo.color} ${agentInfo.border}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{agentInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon status={log.status} />
                          <span className="font-medium text-slate-900 dark:text-white text-sm">{log.action}</span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-col gap-0.5">
                          <span>{log.target}</span>
                          {log.details && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5 hidden group-hover:block transition-all">
                              ↳ {log.details}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        {log.impact ? (
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                            {log.impact}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">&mdash;</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {log.timestamp}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              No actions found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
