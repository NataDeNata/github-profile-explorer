import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

export default function CommitActivityChart({ data, loading, repoName }) {
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
            contentStyle={{ fontSize: '12px' }}
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
