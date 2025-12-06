import React, { useState } from 'react';
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Smartphone,
  Globe,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KPICard from '@/components/ui-custom/KPICard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  AreaChart,
  Area
} from 'recharts';

// Mock data
const stats = [
  { title: 'Total Journeys', value: '12,847', trend: 'up', trendValue: '+15.3%', subtitle: 'vs last month', icon: Users, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
  { title: 'Success Rate', value: '94.2%', trend: 'up', trendValue: '+2.1%', subtitle: 'vs last month', icon: CheckCircle2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  { title: 'Avg. Completion Time', value: '1.8 days', trend: 'down', trendValue: '-0.5 days', subtitle: 'vs last month', icon: Clock, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
  { title: 'Failed Journeys', value: '423', trend: 'down', trendValue: '-18.4%', subtitle: 'vs last month', icon: XCircle, iconColor: 'text-red-600', iconBg: 'bg-red-50' },
  { title: 'Active Contracts', value: '1,234', trend: 'up', trendValue: '+8.2%', subtitle: 'currently active', icon: FileText, iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
];

const funnelData = [
  { name: 'Invited', value: 10000, fill: '#6366f1' },
  { name: 'Consented', value: 8500, fill: '#8b5cf6' },
  { name: 'ID Uploaded', value: 7200, fill: '#a855f7' },
  { name: 'Verified', value: 6800, fill: '#c084fc' },
  { name: 'Signed', value: 6500, fill: '#10b981' },
];

const failureData = [
  { name: 'ID Verification', value: 234, fill: '#ef4444' },
  { name: 'Document Expired', value: 156, fill: '#f97316' },
  { name: 'User Declined', value: 89, fill: '#eab308' },
  { name: 'Technical Error', value: 45, fill: '#6366f1' },
  { name: 'Timeout', value: 34, fill: '#8b5cf6' },
  { name: 'Other', value: 23, fill: '#94a3b8' },
];

const trendsData = [
  { date: 'Jan 1', completed: 156, failed: 12, started: 180 },
  { date: 'Jan 2', completed: 178, failed: 15, started: 210 },
  { date: 'Jan 3', completed: 145, failed: 8, started: 165 },
  { date: 'Jan 4', completed: 189, failed: 10, started: 220 },
  { date: 'Jan 5', completed: 201, failed: 14, started: 235 },
  { date: 'Jan 6', completed: 167, failed: 9, started: 190 },
  { date: 'Jan 7', completed: 198, failed: 11, started: 225 },
];

const templatePerformance = [
  { name: 'Sales Agreement', uses: 456, completionRate: 96.2, avgTime: '1.2 days', failureRate: 3.8, topFailure: 'ID Verification' },
  { name: 'NDA', uses: 389, completionRate: 98.1, avgTime: '0.5 days', failureRate: 1.9, topFailure: 'Timeout' },
  { name: 'Employment Contract', uses: 234, completionRate: 94.5, avgTime: '2.1 days', failureRate: 5.5, topFailure: 'User Declined' },
  { name: 'Partnership Agreement', uses: 156, completionRate: 91.8, avgTime: '3.4 days', failureRate: 8.2, topFailure: 'Document Expired' },
  { name: 'Vendor Agreement', uses: 98, completionRate: 95.2, avgTime: '1.8 days', failureRate: 4.8, topFailure: 'ID Verification' },
];

const deviceData = [
  { name: 'Desktop', value: 62, color: '#6366f1' },
  { name: 'Mobile', value: 31, color: '#10b981' },
  { name: 'Tablet', value: 7, color: '#f59e0b' },
];

const browserData = [
  { name: 'Chrome', value: 58 },
  { name: 'Safari', value: 22 },
  { name: 'Firefox', value: 12 },
  { name: 'Edge', value: 6 },
  { name: 'Other', value: 2 },
];

const heatmapData = [
  { hour: '6AM', Mon: 12, Tue: 15, Wed: 18, Thu: 14, Fri: 11, Sat: 5, Sun: 3 },
  { hour: '9AM', Mon: 45, Tue: 52, Wed: 48, Thu: 55, Fri: 42, Sat: 15, Sun: 8 },
  { hour: '12PM', Mon: 38, Tue: 41, Wed: 44, Thu: 39, Fri: 35, Sat: 12, Sun: 6 },
  { hour: '3PM', Mon: 52, Tue: 58, Wed: 55, Thu: 61, Fri: 48, Sat: 18, Sun: 10 },
  { hour: '6PM', Mon: 28, Tue: 32, Wed: 30, Thu: 35, Fri: 25, Sat: 22, Sun: 15 },
  { hour: '9PM', Mon: 15, Tue: 18, Wed: 16, Thu: 20, Fri: 12, Sat: 25, Sun: 18 },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');
  
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-500 mt-1">Track performance and identify trends.</p>
          </div>
          <div className="flex items-center gap-3">
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
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <KPICard key={index} {...stat} />
          ))}
        </div>
        
        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Signing Funnel */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Signing Funnel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Failure Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Failure Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={failureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {failureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
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
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-slate-500">Failed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-sm text-slate-500">Started</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendsData}>
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
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="started" stroke="#6366f1" fill="url(#colorStarted)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#colorCompleted)" strokeWidth={2} />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Template Performance */}
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Template Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Template</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Uses</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Completion Rate</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Avg. Time</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Failure Rate</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Top Failure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templatePerformance.map((template, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{template.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{template.uses}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${template.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">{template.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{template.avgTime}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${template.failureRate > 5 ? 'text-red-600' : 'text-slate-600'}`}>
                        {template.failureRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{template.topFailure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Device & Browser Stats */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Device Distribution */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Device Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {deviceData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Browser Distribution */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Browser Distribution</h3>
            <div className="space-y-4">
              {browserData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-medium text-slate-900">{item.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Geographic Distribution */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Top Regions</h3>
            <div className="space-y-4">
              {[
                { region: 'United States', count: 4521, percent: 35 },
                { region: 'United Kingdom', count: 2134, percent: 17 },
                { region: 'Germany', count: 1567, percent: 12 },
                { region: 'France', count: 1234, percent: 10 },
                { region: 'Canada', count: 987, percent: 8 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.region}</p>
                      <p className="text-xs text-slate-500">{item.count.toLocaleString()} signings</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}