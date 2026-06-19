import { BarChart, Bar, XAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useIsDark } from '../hooks/useIsDark'

const PERSONALITY_RANGES = [
  { label: 'Night Owl',       hours: [22,23,0,1,2,3,4],  color: '#8b5cf6', badge: 'bg-violet-100  dark:bg-violet-900/30  text-violet-700  dark:text-violet-300',  desc: 'Highest commit density late at night' },
  { label: 'Early Bird',      hours: [5,6,7,8,9],         color: '#f59e0b', badge: 'bg-amber-100   dark:bg-amber-900/30   text-amber-700   dark:text-amber-300',   desc: 'Highest commit density in the early morning' },
  { label: 'Morning Coder',   hours: [10,11,12,13],       color: '#10b981', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', desc: 'Highest commit density late morning to midday' },
  { label: 'Afternoon Coder', hours: [14,15,16,17],       color: '#3b82f6', badge: 'bg-blue-100    dark:bg-blue-900/30    text-blue-700    dark:text-blue-300',    desc: 'Highest commit density in the afternoon' },
  { label: 'Evening Coder',   hours: [18,19,20,21],       color: '#6366f1', badge: 'bg-indigo-100  dark:bg-indigo-900/30  text-indigo-700  dark:text-indigo-300',  desc: 'Highest commit density in the evening' },
]

function getPersonality(byHour) {
  const total = byHour.reduce((s, v) => s + v, 0)
  if (!total) return null
  return PERSONALITY_RANGES
    .map(r => ({ ...r, score: r.hours.reduce((s, h) => s + (byHour[h] || 0), 0) }))
    .reduce((best, r) => r.score > best.score ? r : best)
}

function hourLabel(h) {
  if (h === 0)  return '12am'
  if (h === 12) return '12pm'
  if (h % 6 === 0) return h < 12 ? `${h}am` : `${h - 12}pm`
  return ''
}

function hourTick(h) {
  const n = Number(h)
  return hourLabel(n)
}

export default function PeakHoursChart({ commitsByHour, loading }) {
  // Hook must be called unconditionally — before any early returns
  const dark = useIsDark()

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm flex items-center justify-center min-h-[220px]">
        <div className="w-full animate-pulse space-y-3">
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    )
  }

  const total = commitsByHour.reduce((s, v) => s + v, 0)

  if (!total) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm flex items-center justify-center min-h-[220px]">
        <p className="text-sm text-gray-400">No push activity in the last 90 days</p>
      </div>
    )
  }
  const personality = getPersonality(commitsByHour)
  const peakH = commitsByHour.indexOf(Math.max(...commitsByHour))

  const data = Array.from({ length: 24 }, (_, h) => ({
    h,
    count: commitsByHour[h] || 0,
    peak: Math.abs(h - peakH) <= 1 || Math.abs(h - peakH) >= 23,
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-sm">Work Schedule</h3>
        {personality && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${personality.badge}`}>
            {personality.label}
          </span>
        )}
      </div>
      {personality && (
        <p className="text-xs text-gray-400 mb-3">{personality.desc} · last 90 days (local time)</p>
      )}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: -24 }}>
          <XAxis
            dataKey="h"
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            tickFormatter={hourTick}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <Tooltip
            formatter={v => [v, 'commits']}
            labelFormatter={(_, payload) => {
              if (!payload?.length) return ''
              const h = payload[0].payload.h
              if (h === 0)  return '12:00 AM'
              if (h === 12) return '12:00 PM'
              return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`
            }}
            contentStyle={dark
              ? { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 11, color: '#f9fafb' }
              : { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11, color: '#111827' }
            }
            labelStyle={{ color: dark ? '#f9fafb' : '#111827', fontWeight: 600 }}
            itemStyle={{ color: dark ? '#d1d5db' : '#6b7280' }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.peak && personality ? personality.color : '#e5e7eb'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
