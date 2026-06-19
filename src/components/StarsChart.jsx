import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useIsDark } from '../hooks/useIsDark'

export default function StarsChart({ repos }) {
  const dark = useIsDark()
  const data = [...repos]
    .filter(r => r.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map(r => ({ name: r.name, stars: r.stargazers_count }))

  if (!data.length) return null

  const tooltipStyle = dark
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12, color: '#f9fafb' }
    : { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#111827' }
  const textColor = dark ? '#d1d5db' : '#6b7280'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold mb-2">Top Repos by Stars</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 11, fill: dark ? '#d1d5db' : '#374151' }}
            tickFormatter={v => (v.length > 12 ? `${v.slice(0, 12)}…` : v)}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: dark ? '#f9fafb' : '#111827', fontWeight: 600 }}
            itemStyle={{ color: textColor }}
            formatter={v => [v.toLocaleString(), 'stars']}
          />
          <Bar dataKey="stars" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
