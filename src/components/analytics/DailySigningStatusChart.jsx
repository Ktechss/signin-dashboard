import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle2, XCircle, LogOut, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Status colors matching the reference design
const STATUS_COLORS = {
  completed: '#06b6d4',    // Cyan
  rejected: '#1e3a5f',     // Dark Blue
  abandoned: '#5eead4',    // Light Cyan/Teal
  expired: '#8b5cf6',      // Purple
};

export default function DailySigningStatusChart({ data = [] }) {
  const { t } = useTranslation();
  const abandonedLabel = t('common.abandoned');
  const expiredLabel = t('common.expired');
  const rejectedLabel = t('common.rejected');
  const completedLabel = t('common.completed');

  return (
    <>
      <p className="text-sm text-slate-500 mb-4">
        {t('common.breakdown_of_signing_request_statuses_per_day')}
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '10px',
              boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)',
            }}
          />
          <Bar dataKey="abandoned" stackId="a" fill={STATUS_COLORS.abandoned} name={abandonedLabel} />
          <Bar dataKey="expired" stackId="a" fill={STATUS_COLORS.expired} name={expiredLabel} />
          <Bar dataKey="rejected" stackId="a" fill={STATUS_COLORS.rejected} name={rejectedLabel} />
          <Bar dataKey="completed" stackId="a" fill={STATUS_COLORS.completed} name={completedLabel} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend with icons - order matches visual stack (top to bottom) */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.completed }} />
          <CheckCircle2 className="w-3 h-3 text-slate-400" />
          <span className="text-slate-600 uppercase tracking-wide">{completedLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.rejected }} />
          <XCircle className="w-3 h-3 text-slate-400" />
          <span className="text-slate-600 uppercase tracking-wide">{rejectedLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.abandoned }} />
          <LogOut className="w-3 h-3 text-slate-400" />
          <span className="text-slate-600 uppercase tracking-wide">{abandonedLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.expired }} />
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-slate-600 uppercase tracking-wide">{expiredLabel}</span>
        </div>
      </div>
    </>
  );
}
