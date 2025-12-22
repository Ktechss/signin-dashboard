import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ClientSigningTrendChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="gradientCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradientRejected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#1e293b" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradientExpired" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#64748b' }}
          stroke="#e2e8f0"
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          stroke="#e2e8f0"
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 10px 40px -5px rgb(0 0 0 / 0.15)',
            padding: '12px 16px',
          }}
          labelStyle={{ color: '#1e293b', fontWeight: 600, marginBottom: '8px' }}
          itemStyle={{ padding: '2px 0' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="#06b6d4"
          strokeWidth={2.5}
          fill="url(#gradientCompleted)"
          dot={false}
          activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
          name="Completed"
        />
        <Area
          type="monotone"
          dataKey="rejected"
          stroke="#1e293b"
          strokeWidth={2.5}
          fill="url(#gradientRejected)"
          dot={false}
          activeDot={{ r: 6, fill: '#1e293b', stroke: '#fff', strokeWidth: 2 }}
          name="Rejected"
        />
        <Area
          type="monotone"
          dataKey="expired"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          fill="url(#gradientExpired)"
          dot={false}
          activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
          name="Expired"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
