import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useIsDark } from '../hooks/useIsDark'

export default function CommitActivityChart({ data, loading, repoName }) {
  const dark = useIsDark()
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-center h-full min-h-[260px]">
        <p className="text-gray-400 text-sm">Loading commit data...</p>
      </div>
    )
  }

  if (!data || !data.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-center h-full min-h-[260px]">
        <p className="text-gray-400 text-sm">Commit data unavailable</p>
      </div>
    )
  }

  const chartData = data.map(week => ({
    week: new Date(week.week * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    commits: week.total,
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold mb-1">Commit Activity</h3>
      {repoName && (
        <p className="text-xs text-gray-400 mb-2">{repoName} · last 52 weeks</p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <XAxis dataKey="week" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={dark
              ? { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12, color: '#f9fafb' }
              : { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#111827' }
            }
            labelStyle={{ color: dark ? '#f9fafb' : '#111827', fontWeight: 600 }}
            itemStyle={{ color: dark ? '#d1d5db' : '#6b7280' }}
            formatter={v => [v, 'commits']}
          />
          <Area
            type="monotone"
            dataKey="commits"
            stroke="#6366f1"
            fill="#6366f180"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
