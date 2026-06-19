import { useMemo } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const C1 = '#6366f1' // indigo — user 1
const C2 = '#ec4899' // pink   — user 2

function compatBadgeClass(score) {
  if (score >= 70) return 'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400'
  if (score >= 40) return 'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400'
  return              'bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-400'
}

// Overlap coefficient — sum of per-language minimums (0-100)
function computeCompatibility(lang1, lang2) {
  const total1 = Object.values(lang1).reduce((s, v) => s + v, 0) || 1
  const total2 = Object.values(lang2).reduce((s, v) => s + v, 0) || 1
  const all = new Set([...Object.keys(lang1), ...Object.keys(lang2)])
  let overlap = 0
  all.forEach(l => {
    overlap += Math.min((lang1[l] || 0) / total1, (lang2[l] || 0) / total2)
  })
  return Math.round(overlap * 100)
}

function ProfileMini({ user, repos, color, align }) {
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0)
  const right = align === 'right'
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex flex-col gap-2 ${right ? 'items-end text-right' : 'items-start text-left'}`}>
      <img
        src={user.avatar_url}
        alt={user.login}
        className="w-16 h-16 rounded-full flex-shrink-0"
        style={{ border: `3px solid ${color}` }}
      />
      <div>
        <p className="font-bold text-sm leading-tight">{user.name || user.login}</p>
        <p className="text-xs text-gray-400 mt-0.5">@{user.login}</p>
      </div>
      {user.bio && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 max-w-[180px]">{user.bio}</p>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
        <span>{totalStars.toLocaleString()} stars</span>
        <span>{user.followers.toLocaleString()} followers</span>
        <span>{user.public_repos} repos</span>
      </div>
    </div>
  )
}

function StatRow({ label, value1, value2, format }) {
  const winner = value1 > value2 ? 1 : value2 > value1 ? 2 : 0
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center py-3 gap-2">
      <p
        className={`text-right font-mono tabular-nums text-sm ${winner === 1 ? 'font-bold' : 'text-gray-400 dark:text-gray-500'}`}
        style={winner === 1 ? { color: C1 } : {}}
      >
        {format(value1)}
      </p>
      <p className="text-xs text-gray-400 text-center w-28 shrink-0">{label}</p>
      <p
        className={`text-left font-mono tabular-nums text-sm ${winner === 2 ? 'font-bold' : 'text-gray-400 dark:text-gray-500'}`}
        style={winner === 2 ? { color: C2 } : {}}
      >
        {format(value2)}
      </p>
    </div>
  )
}

export default function VsMode({ user1, repos1, languages1, user2, repos2, languages2 }) {
  const score = useMemo(
    () => computeCompatibility(languages1, languages2),
    [languages1, languages2]
  )

  const radarData = useMemo(() => {
    const total1 = Object.values(languages1).reduce((s, v) => s + v, 0) || 1
    const total2 = Object.values(languages2).reduce((s, v) => s + v, 0) || 1

    const combined = {}
    Object.entries(languages1).forEach(([k, v]) => { combined[k] = (combined[k] || 0) + v / total1 })
    Object.entries(languages2).forEach(([k, v]) => { combined[k] = (combined[k] || 0) + v / total2 })

    return Object.entries(combined)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([lang]) => ({
        lang,
        [user1.login]: Math.round((languages1[lang] || 0) / total1 * 100),
        [user2.login]: Math.round((languages2[lang] || 0) / total2 * 100),
      }))
  }, [languages1, languages2, user1.login, user2.login])

  const stars1 = repos1.reduce((s, r) => s + r.stargazers_count, 0)
  const stars2 = repos2.reduce((s, r) => s + r.stargazers_count, 0)
  const forks1 = repos1.reduce((s, r) => s + r.forks_count, 0)
  const forks2 = repos2.reduce((s, r) => s + r.forks_count, 0)
  const age1 = Math.floor((Date.now() - new Date(user1.created_at)) / (365.25 * 24 * 3600 * 1000))
  const age2 = Math.floor((Date.now() - new Date(user2.created_at)) / (365.25 * 24 * 3600 * 1000))

  const stats = [
    { label: 'Total Stars',   value1: stars1,            value2: stars2,            format: v => v.toLocaleString() },
    { label: 'Followers',     value1: user1.followers,   value2: user2.followers,   format: v => v.toLocaleString() },
    { label: 'Public Repos',  value1: user1.public_repos,value2: user2.public_repos,format: v => String(v) },
    { label: 'Total Forks',   value1: forks1,            value2: forks2,            format: v => v.toLocaleString() },
    { label: 'Account Age',   value1: age1,              value2: age2,              format: v => `${v}y` },
  ]

  return (
    <div className="space-y-6">
      {/* Profile heads */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <ProfileMini user={user1} repos={repos1} color={C1} align="right" />
        <div className="text-3xl font-black text-gray-300 dark:text-gray-600 text-center select-none">
          VS
        </div>
        <ProfileMini user={user2} repos={repos2} color={C2} align="left" />
      </div>

      {/* Stat comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr] border-b border-gray-100 dark:border-gray-700 px-6 py-3">
          <p className="text-right text-xs font-semibold" style={{ color: C1 }}>@{user1.login}</p>
          <div className="w-28" />
          <p className="text-left text-xs font-semibold" style={{ color: C2 }}>@{user2.login}</p>
        </div>
        <div className="px-6 divide-y divide-gray-100 dark:divide-gray-700">
          {stats.map(s => <StatRow key={s.label} {...s} />)}
        </div>
      </div>

      {/* Language radar */}
      {radarData.length >= 3 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Language Overlap</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Compatibility</span>
              <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${compatBadgeClass(score)}`}>
                {score}%
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
              <PolarGrid stroke="#d1d5db" />
              <PolarAngleAxis dataKey="lang" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name={user1.login}
                dataKey={user1.login}
                stroke={C1}
                fill={C1}
                fillOpacity={0.25}
                strokeWidth={2}
                dot={false}
              />
              <Radar
                name={user2.login}
                dataKey={user2.login}
                stroke={C2}
                fill={C2}
                fillOpacity={0.25}
                strokeWidth={2}
                dot={false}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip
                formatter={(v, name) => [`${v}%`, name]}
                contentStyle={{ fontSize: '11px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
