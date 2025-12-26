import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

// Status colors matching the design
const STATUS_COLORS = {
  'Expired': '#8b5cf6',      // Purple
  'Abandoned': '#5eead4',    // Light Teal
  'Rejected': '#1e3a5f',     // Dark Blue
  'Blocked': '#64748b',      // Gray
  'Completed': '#06b6d4',    // Cyan
  'Pending': '#f59e0b',      // Amber
  'In Progress': '#6366f1',  // Indigo
};

export default function SigningDistributionChart({ data = [] }) {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState('');

  // Helper to translate status names
  const translateStatus = (status) => {
    const key = status?.toLowerCase()?.replace(/\s+/g, '_');
    return t(`common.${key}`, { defaultValue: status });
  };

  // Apply consistent colors to data
  const coloredData = data.map(item => ({
    ...item,
    color: STATUS_COLORS[item.name] || item.color || '#94a3b8'
  }));

  useEffect(() => {
    if (coloredData.length > 0 && !selectedStatus) {
      setSelectedStatus(coloredData[0].name);
    }
  }, [coloredData, selectedStatus]);

  const selectedData = coloredData.find(d => d.name === selectedStatus);
  const total = coloredData.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      {/* Header with dropdown */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-500">{t('common.all_statuses_included')}</p>
        {coloredData.length > 0 && (
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px] h-8 text-xs border-slate-200">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: selectedData?.color }}
                />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {coloredData.map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span>{translateStatus(item.name)}</span>
                    <span className="text-slate-400">({item.value.toLocaleString()})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={coloredData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              dataKey="value"
              paddingAngle={1}
              stroke="#fff"
              strokeWidth={2}
            >
              {coloredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => value.toLocaleString()}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Label - shows selected status */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">
              {selectedData?.value?.toLocaleString() || total.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              {selectedStatus ? translateStatus(selectedStatus) : t('common.total')}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
        {coloredData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600 uppercase tracking-wide">{translateStatus(item.name)}:</span>
            <span className="font-semibold text-slate-900">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </>
  );
}
