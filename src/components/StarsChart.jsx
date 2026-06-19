import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

export default function StarsChart({ repos }) {
  const data = [...repos]
    .filter(r => r.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map(r => ({ name: r.name, stars: r.stargazers_count }))

  if (!data.length) return null

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
            tick={{ fontSize: 11 }}
            tickFormatter={v => (v.length > 12 ? `${v.slice(0, 12)}…` : v)}
          />
          <Tooltip
            contentStyle={{ fontSize: '12px' }}
            formatter={v => [v.toLocaleString(), 'stars']}
          />
          <Bar dataKey="stars" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
