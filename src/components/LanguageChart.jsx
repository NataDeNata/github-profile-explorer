import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { langColor } from '../utils/langColors'

export default function LanguageChart({ languages }) {
  const entries = Object.entries(languages)
  if (!entries.length) return null

  const total = entries.reduce((sum, [, v]) => sum + v, 0)

  const data = entries
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, bytes]) => ({
      name,
      value: bytes,
      percent: ((bytes / total) * 100).toFixed(1),
    }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold mb-2">Languages</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map(entry => (
              <Cell key={entry.name} fill={langColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${((value / total) * 100).toFixed(1)}%`,
              name,
            ]}
          />
          <Legend
            formatter={(value, entry) => `${value} ${entry.payload.percent}%`}
            iconSize={10}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
