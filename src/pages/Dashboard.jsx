import { useState } from 'react';
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
  FileSignature,
  TrendingUp,
  TrendingDown,
  Users,
  Signature,
  RefreshCw,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { dashboardApi, analyticsApi, channelsApi } from '@/services/api';
import { useFetch } from '@/hooks/useApi';
import {
  ClientSigningTrendChart,
  SigningByChannelChart,
  ContractStatusChart,
  SigningDistributionChart,
} from '@/components/analytics';

export default function Dashboard({ selectedClient }) {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedChannel, setSelectedChannel] = useState('all');

  // Get client ID for filtering
  const clientId = selectedClient?.id ? String(selectedClient.id) : null;

  // Fetch dashboard data filtered by client
  const { data: kpiData, loading: kpiLoading, refetch: refetchKpi } = useFetch(
    () => dashboardApi.getKpi(clientId),
    [clientId]
  );

  const { data: trendsData, loading: trendsLoading, refetch: refetchTrends } = useFetch(
    () => dashboardApi.getTrends(clientId),
    [clientId]
  );

  const { data: recentContracts, loading: contractsLoading, refetch: refetchContracts } = useFetch(
    () => dashboardApi.getRecentContracts(clientId),
    [clientId]
  );

  const { data: recentActivity, loading: activityLoading, refetch: refetchActivity } = useFetch(
    () => dashboardApi.getRecentActivity(clientId),
    [clientId]
  );

  // Fetch analytics data filtered by client
  const { data: dailyStatus, loading: dailyLoading } = useFetch(
    () => analyticsApi.getDailyStatus(clientId),
    [clientId]
  );

  const { data: byChannel, loading: channelLoading } = useFetch(
    () => analyticsApi.getByChannel(clientId),
    [clientId]
  );

  const { data: contractStatus, loading: contractStatusLoading } = useFetch(
    () => analyticsApi.getContractStatus(clientId),
    [clientId]
  );

  const { data: distribution, loading: distLoading } = useFetch(
    () => analyticsApi.getDistribution(clientId),
    [clientId]
  );

  const { data: channelsData } = useFetch(() => channelsApi.getAll(), []);

  const channels = [
    { id: 'all', name: 'All Channels' },
    ...(channelsData || []).map(c => ({ id: String(c.id), name: c.name }))
  ];

  const handleRefresh = () => {
    refetchKpi();
    refetchTrends();
    refetchContracts();
    refetchActivity();
  };

  const isLoading = kpiLoading || trendsLoading;

  // Helper to find KPI by id from the array
  const getKpi = (id) => {
    if (!kpiData || !Array.isArray(kpiData)) return { value: '0', trendValue: '0%' };
    const kpi = kpiData.find(k => k.id === id);
    return kpi || { value: '0', trendValue: '0%' };
  };

  // Extract KPI values
  const kpis = {
    totalJourneys: getKpi('total-journeys'),
    completed: getKpi('contracts-signed'),
    pending: { value: '44', trendValue: '-5.2%' }, // Not in API, using placeholder
    failed: { value: '12', trendValue: '-2.1%' }, // Not in API, using placeholder
    successRate: getKpi('success-rate'),
    activeBlueprints: getKpi('active-blueprints'),
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
            <p className="text-slate-500 mt-0.5">
              {selectedClient
                ? `Signing activity and performance for ${selectedClient.name}`
                : 'Monitor your signing activity and performance'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px] bg-white">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link to={createPageUrl('TemplateBuilder')}>
              <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
                <FileSignature className="w-4 h-4" />
                New Contract
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total Signing Requests"
            value={kpis.totalJourneys.value}
            trend={kpis.totalJourneys.trendValue}
            icon={Signature}
            loading={kpiLoading}
          />
          <KPICard
            label="Completed"
            value={kpis.completed.value}
            trend={kpis.completed.trendValue}
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            loading={kpiLoading}
          />
          <KPICard
            label="Pending"
            value={kpis.pending.value}
            trend={kpis.pending.trendValue}
            icon={Clock}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            loading={kpiLoading}
          />
          <KPICard
            label="Failed"
            value={kpis.failed.value}
            trend={kpis.failed.trendValue}
            icon={XCircle}
            iconColor="text-red-500"
            iconBg="bg-red-50"
            loading={kpiLoading}
          />
        </div>

        {/* Signing Trends - Full Width Area Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Signing Trends</h3>
              <p className="text-sm text-slate-500 mt-0.5">Track signing request performance over time</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">Last 14 days</span>
          </div>
          {dailyLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <ClientSigningTrendChart data={dailyStatus || []} />
          )}
        </div>

        {/* Charts Row - 3 column grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Signing by Channel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Signing by Channel</h3>
              <span className="text-xs text-slate-400">Distribution</span>
            </div>
            {channelLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <SigningByChannelChart data={byChannel || []} />
            )}
          </div>

          {/* Contract Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Contract Status</h3>
              <span className="text-xs text-slate-400">Current breakdown</span>
            </div>
            {contractStatusLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <ContractStatusChart data={contractStatus || []} />
            )}
          </div>

          {/* Signing Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Signing Distribution</h3>
              <span className="text-xs text-slate-400">By status</span>
            </div>
            {distLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <SigningDistributionChart data={distribution || []} />
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Recent Contracts */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Recent Contracts</h3>
              <Link to={createPageUrl('Current')}>
                <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            {contractsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {(recentContracts || []).slice(0, 5).map(contract => (
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
                        <p className="text-sm font-medium text-slate-900">{contract.templateName || contract.template}</p>
                        <p className="text-xs text-slate-500">{contract.reference}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-500">{contract.signedCount || 0}/{contract.totalParties || 0} signed</p>
                        <p className="text-xs text-slate-400">{contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : ''}</p>
                      </div>
                      <StatusBadge status={contract.status} size="sm" />
                    </div>
                  </Link>
                ))}
                {(!recentContracts || recentContracts.length === 0) && (
                  <div className="px-5 py-8 text-center text-slate-400">
                    No recent contracts
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Recent Activity</h3>
              </div>
              {activityLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {(recentActivity || []).slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-5 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'completed' ? 'bg-emerald-100' :
                        activity.type === 'started' ? 'bg-blue-100' :
                        activity.type === 'failed' ? 'bg-red-100' : 'bg-slate-100'
                      }`}>
                        {activity.type === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : activity.type === 'failed' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Signature className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{activity.description}</p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                  {(!recentActivity || recentActivity.length === 0) && (
                    <div className="px-5 py-8 text-center text-slate-400">
                      No recent activity
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">This Month</p>
                  <p className="text-2xl font-bold">{kpis.totalJourneys.value}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-slate-400">Success Rate</p>
                  <p className="text-lg font-semibold">{kpis.successRate.value}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Avg. Time</p>
                  <p className="text-lg font-semibold">4.2 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ label, value, trend, icon: Icon, iconColor = "text-slate-600", iconBg = "bg-slate-50", loading }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {loading ? (
        <div className="h-16 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-2xl font-bold text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
              <TrendIndicator trend={trend} />
            </div>
          </div>
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      )}
    </div>
  );
}

// Trend Indicator Component
function TrendIndicator({ trend }) {
  if (!trend) return null;

  const isPositive = trend.startsWith('+');
  const isNegative = trend.startsWith('-');

  return (
    <span className={`text-xs flex items-center gap-0.5 mb-0.5 ${
      isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-slate-400'
    }`}>
      {isPositive && <TrendingUp className="w-3 h-3" />}
      {isNegative && <TrendingDown className="w-3 h-3" />}
      {trend}
    </span>
  );
}
