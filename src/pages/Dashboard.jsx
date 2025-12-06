import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  ArrowRight,
  Bell,
  PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import KPICard from '@/components/ui-custom/KPICard';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import ProgressBar from '@/components/ui-custom/ProgressBar';
import { PartyStatusGroup } from '@/components/ui-custom/PartyStatusIcon';

// Mock data
const stats = [
  { title: 'Total Contracts', value: '2,847', trend: 'up', trendValue: '+12.5%', icon: FileText, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
  { title: 'Completed', value: '2,156', trend: 'up', trendValue: '+8.2%', icon: CheckCircle2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  { title: 'Pending Signatures', value: '423', trend: 'down', trendValue: '-3.1%', icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
  { title: 'Failed / Expired', value: '68', trend: 'down', trendValue: '-15.4%', icon: AlertCircle, iconColor: 'text-red-600', iconBg: 'bg-red-50' },
];

const recentContracts = [
  { id: 1, name: 'Sales Agreement - Acme Corp', reference: 'SA-2024-001', status: 'in_progress', signedCount: 2, totalParties: 3, parties: [{ name: 'John', status: 'signed' }, { name: 'Jane', status: 'signed' }, { name: 'Bob', status: 'pending' }], expiresIn: '2 days' },
  { id: 2, name: 'NDA - TechStart Inc', reference: 'NDA-2024-089', status: 'signed', signedCount: 2, totalParties: 2, parties: [{ name: 'Alice', status: 'signed' }, { name: 'Tom', status: 'signed' }], expiresIn: null },
  { id: 3, name: 'Employment Contract - Sarah M.', reference: 'EC-2024-156', status: 'pending', signedCount: 0, totalParties: 2, parties: [{ name: 'Sarah', status: 'pending' }, { name: 'HR', status: 'pending' }], expiresIn: '5 days' },
  { id: 4, name: 'Partnership Agreement', reference: 'PA-2024-023', status: 'failed', signedCount: 1, totalParties: 3, parties: [{ name: 'Mike', status: 'signed' }, { name: 'Lisa', status: 'failed' }, { name: 'Dave', status: 'pending' }], expiresIn: null },
];

const notifications = [
  { id: 1, type: 'warning', title: 'Contract Expiring Soon', description: 'Sales Agreement SA-2024-001 expires in 2 days', time: '5 min ago' },
  { id: 2, type: 'success', title: 'Signature Completed', description: 'Alice signed NDA-2024-089', time: '1 hour ago' },
  { id: 3, type: 'error', title: 'Verification Failed', description: 'Lisa failed identity verification for PA-2024-023', time: '2 hours ago' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, John. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">3</span>
            </Button>
            <Link to={createPageUrl('SignContract')}>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <PenTool className="w-4 h-4" />
                New Contract
              </Button>
            </Link>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <KPICard key={index} {...stat} />
          ))}
        </div>
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Contracts */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/60 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Contracts</h2>
              <Link to={createPageUrl('Contracts')}>
                <Button variant="ghost" size="sm" className="gap-1 text-indigo-600">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentContracts.map(contract => (
                <div key={contract.id} className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-slate-900">{contract.name}</h3>
                      <p className="text-sm text-slate-500">{contract.reference}</p>
                    </div>
                    <StatusBadge status={contract.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <PartyStatusGroup parties={contract.parties} />
                      <ProgressBar 
                        value={contract.signedCount} 
                        max={contract.totalParties} 
                        className="w-24"
                      />
                      <span className="text-xs text-slate-500">
                        {contract.signedCount}/{contract.totalParties}
                      </span>
                    </div>
                    {contract.expiresIn && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {contract.expiresIn}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Notifications */}
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Activity</h2>
              <Link to={createPageUrl('Notifications')}>
                <Button variant="ghost" size="sm" className="text-indigo-600">View all</Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {notifications.map(notification => (
                <div key={notification.id} className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      notification.type === 'success' ? 'bg-emerald-500' :
                      notification.type === 'error' ? 'bg-red-500' :
                      'bg-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900">{notification.title}</p>
                      <p className="text-sm text-slate-500 truncate">{notification.description}</p>
                      <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-500">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">94.2%</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-sm text-slate-500">Avg. Completion</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">1.8 days</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-500">Active Templates</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">24</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm text-slate-500">This Month</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">156</p>
          </div>
        </div>
      </div>
    </div>
  );
}