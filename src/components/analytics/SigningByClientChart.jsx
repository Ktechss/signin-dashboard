import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function SigningByClientChart({ data = [] }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradientAD" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientEN" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientFA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientMB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area type="monotone" dataKey="ad" stroke="#6366f1" strokeWidth={2} fill="url(#gradientAD)" name="ADCB Bank" />
          <Area type="monotone" dataKey="en" stroke="#10b981" strokeWidth={2} fill="url(#gradientEN)" name="Emirates NBD" />
          <Area type="monotone" dataKey="fa" stroke="#f59e0b" strokeWidth={2} fill="url(#gradientFA)" name="First Abu Dhabi" />
          <Area type="monotone" dataKey="mb" stroke="#ec4899" strokeWidth={2} fill="url(#gradientMB)" name="Mashreq Bank" />
        </AreaChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
          <span className="text-slate-600">ADCB Bank</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span className="text-slate-600">Emirates NBD</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="text-slate-600">First Abu Dhabi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
          <span className="text-slate-600">Mashreq Bank</span>
        </div>
      </div>
    </>
  );
}
