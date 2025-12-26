import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { createPageUrl } from '@/utils';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  FileSignature,
  Signature,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import KPICard from '@/components/ui-custom/KPICard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import { dashboardApi, analyticsApi } from '@/services/api';
import { useFetch } from '@/hooks/useApi';
import {
  ClientSigningTrendChart,
  SigningByChannelChart,
  ContractStatusChart,
  SigningDistributionChart,
} from '@/components/analytics';

export default function Dashboard({ selectedClient }) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [dateRange, setDateRange] = useState('30d');

  // Get client ID for filtering
  const clientId = selectedClient?.id ? String(selectedClient.id) : null;

  // Fetch dashboard data filtered by client
  const { data: kpiData, loading: kpiLoading } = useFetch(
    () => dashboardApi.getKpi(clientId),
    [clientId]
  );

  const { data: trendsData, loading: trendsLoading } = useFetch(
    () => dashboardApi.getTrends(clientId),
    [clientId]
  );

  const { data: recentContracts, loading: contractsLoading } = useFetch(
    () => dashboardApi.getRecentContracts(clientId),
    [clientId]
  );

  const { data: recentActivity, loading: activityLoading } = useFetch(
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
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.overview')}</h1>
            <p className="text-slate-500 mt-0.5">
              {selectedClient
                ? t('dashboard.signingActivityFor', { clientName: selectedClient.name })
                : t('dashboard.monitorActivity')
              }
            </p>
          </div>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className={`w-[140px] bg-white ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-slate-400`} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t('dashboard.last7Days')}</SelectItem>
                <SelectItem value="30d">{t('dashboard.last30Days')}</SelectItem>
                <SelectItem value="90d">{t('dashboard.last90Days')}</SelectItem>
                <SelectItem value="1y">{t('dashboard.lastYear')}</SelectItem>
              </SelectContent>
            </Select>
            <Link to={createPageUrl('TemplateBuilder')}>
              <Button className={`gap-2 bg-slate-900 hover:bg-slate-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <FileSignature className="w-4 h-4" />
                {t('dashboard.newContract')}
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title={t('dashboard.totalSigningRequests')}
            value={kpis.totalJourneys.value}
            trend={kpis.totalJourneys.trendValue?.startsWith('+') ? 'up' : kpis.totalJourneys.trendValue?.startsWith('-') ? 'down' : 'neutral'}
            trendValue={kpis.totalJourneys.trendValue}
            icon={Signature}
          />
          <KPICard
            title={t('dashboard.completed')}
            value={kpis.completed.value}
            trend={kpis.completed.trendValue?.startsWith('+') ? 'up' : kpis.completed.trendValue?.startsWith('-') ? 'down' : 'neutral'}
            trendValue={kpis.completed.trendValue}
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <KPICard
            title={t('dashboard.pending')}
            value={kpis.pending.value}
            trend={kpis.pending.trendValue?.startsWith('+') ? 'up' : kpis.pending.trendValue?.startsWith('-') ? 'down' : 'neutral'}
            trendValue={kpis.pending.trendValue}
            icon={Clock}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <KPICard
            title={t('dashboard.failed')}
            value={kpis.failed.value}
            trend={kpis.failed.trendValue?.startsWith('+') ? 'up' : kpis.failed.trendValue?.startsWith('-') ? 'down' : 'neutral'}
            trendValue={kpis.failed.trendValue}
            icon={XCircle}
            iconColor="text-red-500"
            iconBg="bg-red-50"
          />
        </div>

        {/* Signing Trends - Full Width Area Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <h3 className="font-semibold text-slate-900 text-lg">{t('dashboard.signingTrends')}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{t('dashboard.trackPerformance')}</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">{t('dashboard.last14Days')}</span>
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
            <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="font-semibold text-slate-900">{t('dashboard.signingByChannel')}</h3>
              <span className="text-xs text-slate-400">{t('dashboard.distribution')}</span>
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
            <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="font-semibold text-slate-900">{t('dashboard.contractStatus')}</h3>
              <span className="text-xs text-slate-400">{t('dashboard.currentBreakdown')}</span>
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
            <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="font-semibold text-slate-900">{t('dashboard.signingDistribution')}</h3>
              <span className="text-xs text-slate-400">{t('dashboard.byStatus')}</span>
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
            <div className={`flex items-center justify-between px-5 py-4 border-b border-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="font-semibold text-slate-900">{t('dashboard.recentContracts')}</h3>
              <Link to={createPageUrl('Current')}>
                <Button variant="ghost" size="sm" className={`gap-1 text-slate-500 hover:text-slate-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {t('dashboard.viewAll')}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
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
                    {t('dashboard.noRecentContracts')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className={`px-5 py-4 border-b border-slate-100 ${isRTL ? 'text-right' : ''}`}>
                <h3 className="font-semibold text-slate-900">{t('dashboard.recentActivity')}</h3>
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
                      {t('dashboard.noRecentActivity')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white">
              <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-slate-300">{t('dashboard.thisMonth')}</p>
                  <p className="text-2xl font-bold">{kpis.totalJourneys.value}</p>
                </div>
              </div>
              <div className={`flex items-center justify-between pt-4 border-t border-white/10 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-xs text-slate-400">{t('dashboard.successRate')}</p>
                  <p className="text-lg font-semibold">{kpis.successRate.value}</p>
                </div>
                <div className={isRTL ? 'text-left' : 'text-right'}>
                  <p className="text-xs text-slate-400">{t('dashboard.avgTime')}</p>
                  <p className="text-lg font-semibold">4.2 {t('dashboard.hours')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
