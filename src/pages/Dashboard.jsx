import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ArrowUpRight,
  Layers,
  FileSignature
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui-custom/StatusBadge';

// Stats data
const stats = {
  contracts: {
    total: 847,
    signed: 756,
    pending: 64,
    failed: 27
  },
  requests: {
    total: 1234,
    authorised: 1098,
    pending: 68,
    rejected: 68
  }
};

// Recent contracts
const recentContracts = [
  { id: 1, reference: 'SA-2024-001', template: 'Sales Agreement', status: 'in_progress', parties: 3, signed: 2, date: 'Jan 17' },
  { id: 2, reference: 'NDA-2024-089', template: 'NDA', status: 'signed', parties: 2, signed: 2, date: 'Jan 17' },
  { id: 3, reference: 'EC-2024-156', template: 'Employment', status: 'pending', parties: 2, signed: 0, date: 'Jan 16' },
  { id: 4, reference: 'PA-2024-023', template: 'Partnership', status: 'failed', parties: 3, signed: 1, date: 'Jan 16' },
  { id: 5, reference: 'SVC-2024-045', template: 'Service Agreement', status: 'in_progress', parties: 2, signed: 1, date: 'Jan 15' },
];

// Recent signing requests
const recentRequests = [
  { id: 1, token: 'TKN-8F2A-X9K1', status: 'authorised', time: '2 hours ago' },
  { id: 2, token: 'TKN-3B7C-M4P2', status: 'authorised', time: '5 hours ago' },
  { id: 3, token: 'TKN-5D9E-Q6R3', status: 'pending', time: '1 day ago' },
  { id: 4, token: 'TKN-7F1G-S8T4', status: 'rejected', time: '2 days ago' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-0.5">Overview of your signing activity</p>
          </div>
          <Link to={createPageUrl('TemplateBuilder')}>
            <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
              <FileSignature className="w-4 h-4" />
              New Contract
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Contracts"
            value={stats.contracts.total}
            icon={FileText}
          />
          <StatCard
            label="Completed"
            value={stats.contracts.signed}
            icon={CheckCircle2}
            iconColor="text-emerald-600"
          />
          <StatCard
            label="Pending"
            value={stats.contracts.pending}
            icon={Clock}
            iconColor="text-amber-600"
          />
          <StatCard
            label="Failed"
            value={stats.contracts.failed}
            icon={XCircle}
            iconColor="text-red-500"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Recent Contracts */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Contracts</h2>
              <Link to={createPageUrl('Current')}>
                <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentContracts.map(contract => (
                <Link
                  key={contract.id}
                  to={createPageUrl(`ContractDetail?id=${contract.id}`)}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{contract.template}</p>
                      <p className="text-xs text-slate-500">{contract.reference}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-500">{contract.signed}/{contract.parties} signed</p>
                      <p className="text-xs text-slate-400">{contract.date}</p>
                    </div>
                    <StatusBadge status={contract.status} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Signing Requests Stats */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Signing Requests</h2>
                <Link to={createPageUrl('Current')}>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Total" value={stats.requests.total} />
                <MiniStat label="Authorised" value={stats.requests.authorised} color="emerald" />
                <MiniStat label="Pending" value={stats.requests.pending} color="amber" />
                <MiniStat label="Rejected" value={stats.requests.rejected} color="red" />
              </div>
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Latest Requests</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {recentRequests.map(request => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-700">
                        {request.token}
                      </code>
                      <p className="text-xs text-slate-400 mt-1">{request.time}</p>
                    </div>
                    <StatusBadge status={request.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Active Blueprints</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-slate-400">Success Rate</p>
                  <p className="text-lg font-semibold">94.2%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Avg. Completion</p>
                  <p className="text-lg font-semibold">1.8 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon: Icon, iconColor = "text-slate-600" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value.toLocaleString()}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

// Mini Stat Component
function MiniStat({ label, value, color }) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-xl p-3 ${color ? colorClasses[color] : 'bg-slate-50 text-slate-700'}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-lg font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
