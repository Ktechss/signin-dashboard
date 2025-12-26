import { useState } from 'react';
import {
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Users,
  Loader2,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Line
} from 'recharts';
import { useAuth } from '@/pages/index';
import { analyticsApi, dashboardApi } from '@/services/api';
import { useFetch } from '@/hooks/useApi';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');

  // Get selected client from auth context
  const { selectedClient } = useAuth();
  const clientId = selectedClient?.id || 'all';

  // Fetch analytics data with client filter
  const { data: kpiData, loading: kpiLoading } = useFetch(() => dashboardApi.getKpi(clientId), [clientId]);
  const { data: trendsData, loading: trendsLoading } = useFetch(() => dashboardApi.getTrends(clientId), [clientId]);
  const { data: distributionData, loading: distLoading } = useFetch(() => analyticsApi.getDistribution(clientId), [clientId]);
  const { data: channelData, loading: channelLoading } = useFetch(() => analyticsApi.getByChannel(clientId), [clientId]);
  const { data: deviceData, loading: deviceLoading } = useFetch(() => analyticsApi.getDevices(clientId), [clientId]);
  const { data: contractStatus, loading: contractLoading } = useFetch(() => analyticsApi.getContractStatus(clientId), [clientId]);

  const isLoading = kpiLoading || trendsLoading || distLoading || channelLoading || deviceLoading || contractLoading;

  // Build KPI stats from API data
  const stats = kpiData ? [
    {
      title: 'Total Signing Requests',
      value: kpiData.find(k => k.id === 'total-journeys')?.value || '0',
      trend: 'up',
      trendValue: kpiData.find(k => k.id === 'total-journeys')?.trendValue || '+0%',
      subtitle: 'vs last month',
      icon: Users,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50'
    },
    {
      title: 'Success Rate',
      value: kpiData.find(k => k.id === 'success-rate')?.value || '0%',
      trend: 'up',
      trendValue: kpiData.find(k => k.id === 'success-rate')?.trendValue || '+0%',
      subtitle: 'vs last month',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    },
    {
      title: 'Contracts Signed',
      value: kpiData.find(k => k.id === 'contracts-signed')?.value || '0',
      trend: 'up',
      trendValue: kpiData.find(k => k.id === 'contracts-signed')?.trendValue || '+0%',
      subtitle: 'vs last month',
      icon: FileText,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50'
    },
    {
      title: 'Active Blueprints',
      value: kpiData.find(k => k.id === 'active-blueprints')?.value || '0',
      trend: 'up',
      trendValue: kpiData.find(k => k.id === 'active-blueprints')?.trendValue || '+0',
      subtitle: 'currently active',
      icon: Clock,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    },
  ] : [];

  // Transform trends data for chart
  const chartTrendsData = (trendsData || []).map(item => ({
    date: item.date,
    completed: item.completed,
    started: item.journeys,
    failed: item.journeys - item.completed
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {selectedClient ? `${selectedClient.name} Analytics` : 'Analytics'}
            </h1>
            <p className="text-slate-500 mt-1">
              {selectedClient ? 'Client performance and trends' : 'Track performance and identify trends'}
            </p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="w-4 h-4 mr-2" />
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <KPICard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Signing Distribution */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Signing Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {(distributionData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {(distributionData || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Distribution */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Signing by Channel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {(channelData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trends Chart */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Signing Trends</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-500">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-sm text-slate-500">Started</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartTrendsData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorStarted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="started" stroke="#6366f1" fill="url(#colorStarted)" strokeWidth={2} name="Started" />
              <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#colorCompleted)" strokeWidth={2} name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device & Contract Status */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Device Distribution */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Device Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {(deviceData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {(deviceData || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contract Status */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Contract Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={contractStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {(contractStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {(contractStatus || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
