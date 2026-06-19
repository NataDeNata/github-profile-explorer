import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { langColor } from '../utils/langColors'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-900 dark:text-gray-100">{d.name}</p>
      {d.language !== 'Other' && <p className="text-gray-500 mt-0.5">{d.language}</p>}
      <p className="text-gray-500">{d.rawSize >= 1024 ? `${(d.rawSize / 1024).toFixed(1)} MB` : `${d.rawSize} KB`}</p>
      {d.stars > 0 && <p className="text-gray-500">{d.stars.toLocaleString()} stars</p>}
    </div>
  )
}

function sizeTickLabel(logVal) {
  const kb = Math.pow(2, logVal)
  if (kb >= 1024) return `${(kb / 1024).toFixed(0)}MB`
  if (kb >= 1)    return `${Math.round(kb)}KB`
  return ''
}

export default function RepoScatterChart({ repos }) {
  const data = repos
    .filter(r => r.size > 0)
    .map(r => ({
      name: r.name,
      sizeLog: Math.log2(r.size),
      rawSize: r.size,
      stars: r.stargazers_count,
      language: r.language || 'Other',
    }))

  if (data.length < 3) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-sm mb-1">Code Weight vs. Popularity</h3>
      <p className="text-xs text-gray-400 mb-3">repository size vs. stars</p>
      <ResponsiveContainer width="100%" height={180}>
        <ScatterChart margin={{ top: 4, right: 16, bottom: 0, left: -8 }}>
          <XAxis
            dataKey="sizeLog"
            type="number"
            name="Size"
            tickFormatter={sizeTickLabel}
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <YAxis
            dataKey="stars"
            type="number"
            name="Stars"
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: '3 3', stroke: '#9ca3af' }}
          />
          <Scatter data={data}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={langColor(d.language)}
                fillOpacity={0.75}
                stroke={langColor(d.language)}
                strokeWidth={1}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
