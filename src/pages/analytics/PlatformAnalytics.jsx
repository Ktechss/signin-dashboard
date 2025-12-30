import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Building2,
  Signature,
  Loader2,
  Layers,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import KPICard from '@/components/ui-custom/KPICard';
import {
  DailySigningStatusChart,
  SigningDistributionChart,
  SigningByClientChart,
  SigningByChannelChart,
  ContractStatusChart,
  DeviceDistributionChart,
} from '@/components/analytics';
import { analyticsApi, clientsApi } from '@/services/api';
import { useFetch } from '@/hooks/useApi';

export default function PlatformAnalytics() {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedClient, setSelectedClient] = useState('all');

  // Fetch clients for filter
  const { data: clientsData } = useFetch(() => clientsApi.getAll(), []);

  // Fetch analytics data
  const { data: platformStats, loading: statsLoading } = useFetch(
    () => analyticsApi.getPlatformStats(selectedClient),
    [selectedClient]
  );
  const { data: dailyStatus, loading: dailyLoading } = useFetch(
    () => analyticsApi.getDailyStatus(selectedClient),
    [selectedClient]
  );
  const { data: distribution, loading: distLoading } = useFetch(
    () => analyticsApi.getDistribution(selectedClient),
    [selectedClient]
  );
  const { data: byClient, loading: byClientLoading } = useFetch(
    () => analyticsApi.getByClient(),
    []
  );
  const { data: byChannel, loading: byChannelLoading } = useFetch(
    () => analyticsApi.getByChannel(selectedClient),
    [selectedClient]
  );
  const { data: contractStatus, loading: contractLoading } = useFetch(
    () => analyticsApi.getContractStatus(selectedClient),
    [selectedClient]
  );
  const { data: devices, loading: devicesLoading } = useFetch(
    () => analyticsApi.getDevices(selectedClient),
    [selectedClient]
  );

  // Build clients list for filter
  const clients = [
    { id: 'all', name: 'All Clients' },
    ...(clientsData || []).map(c => ({ id: String(c.id), name: c.name, abbr: c.abbr }))
  ];

  // Build KPI stats from platform stats
  const kpiStats = platformStats ? [
    {
      title: 'Total Signing Requests',
      value: platformStats.totalJourneys?.value?.toLocaleString() || '0',
      trend: 'up',
      trendValue: platformStats.totalJourneys?.trend || '+0%',
      subtitle: 'vs last month',
      icon: Users,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      title: 'Contracts Signed',
      value: platformStats.contractsSigned?.value?.toLocaleString() || '0',
      trend: 'up',
      trendValue: platformStats.contractsSigned?.trend || '+0%',
      subtitle: 'vs last month',
      icon: Signature,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      title: 'Active Blueprints',
      value: platformStats.activeBlueprints?.value?.toString() || '0',
      trend: 'up',
      trendValue: platformStats.activeBlueprints?.trend || '+0',
      subtitle: 'new this month',
      icon: Layers,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
    },
    {
      title: 'Success Rate',
      value: platformStats.successRate?.value || '0%',
      trend: 'up',
      trendValue: platformStats.successRate?.trend || '+0%',
      subtitle: 'vs last month',
      icon: CheckCircle2,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
    },
    {
      title: 'Avg. Completion',
      value: platformStats.avgCompletion?.value || '0 days',
      trend: 'down',
      trendValue: platformStats.avgCompletion?.trend || '-0 days',
      subtitle: 'faster than before',
      icon: Clock,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
            <p className="text-slate-500 mt-1">
              Centralized analytics across all clients and channels.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Client Filter */}
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
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
          </div>
        </div>

        {/* KPI Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-5 h-32 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpiStats.map((stat, index) => (
              <KPICard key={index} {...stat} />
            ))}
          </div>
        )}

        {/* Daily Signing Status & Signing Distribution */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily Signing Status - spans 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Daily Signing Status</h3>
              <span className="text-xs text-slate-400">Last 14 days</span>
            </div>
            {dailyLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <DailySigningStatusChart data={dailyStatus || []} />
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

        {/* Signing Requests by Client - Only visible when All Clients selected */}
        {selectedClient === 'all' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Signing Requests by Client</h3>
              <span className="text-xs text-slate-400">Comparison over time</span>
            </div>
            {byClientLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <SigningByClientChart data={byClient || []} />
            )}
          </div>
        )}

        {/* Second Row - Pie Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Signing by Channel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Signing by Channel</h3>
              <span className="text-xs text-slate-400">Distribution</span>
            </div>
            {byChannelLoading ? (
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
            {contractLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <ContractStatusChart data={contractStatus || []} />
            )}
          </div>

          {/* Device Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Device Distribution</h3>
              <span className="text-xs text-slate-400">By device type</span>
            </div>
            {devicesLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <DeviceDistributionChart data={devices || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
