import { langColor } from '../utils/langColors'

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export default function SnapshotCard({ forwardRef, user, repos, languages, avatarSrc }) {
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)
  const totalBytes = Object.values(languages).reduce((s, v) => s + v, 0)
  const topLangs = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, bytes]) => ({ name, pct: totalBytes ? Math.round((bytes / totalBytes) * 100) : 0 }))

  const stats = [
    { label: 'Followers', value: fmt(user.followers) },
    { label: 'Following', value: fmt(user.following) },
    { label: 'Repos',     value: fmt(repos.length) },
    { label: 'Stars',     value: fmt(totalStars) },
  ]

  return (
    <div
      ref={forwardRef}
      style={{
        width: 800,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header bar */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg viewBox="0 0 24 24" width={22} height={22} fill="white" aria-hidden="true">
            <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.31 3.435 9.817 8.205 11.405.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .319.218.694.825.576C20.565 22.313 24 17.807 24 12.5 24 5.87 18.627.5 12 .5z"/>
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500, letterSpacing: '0.02em' }}>GitHub Profile Explorer</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>github.com/{user.login}</span>
      </div>

      {/* Main content */}
      <div style={{ padding: '28px 28px 0' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <img
            src={avatarSrc || user.avatar_url}
            alt={user.name || user.login}
            style={{ width: 88, height: 88, borderRadius: '50%', border: '3px solid #e0e7ff', flexShrink: 0 }}
          />

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {user.name || user.login}
            </div>
            <div style={{ fontSize: 14, color: '#6366f1', marginTop: 3, fontWeight: 500 }}>
              @{user.login}
            </div>
            {user.bio && (
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {user.bio}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {user.company && (
                <span style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                  🏢 {user.company}
                </span>
              )}
              {user.location && (
                <span style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                  📍 {user.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 0, marginTop: 24, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ flex: 1, padding: '14px 0', textAlign: 'center', background: i % 2 === 0 ? '#f9fafb' : '#ffffff', borderRight: i < stats.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Languages */}
        {topLangs.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Top Languages
            </div>
            {/* Segmented bar */}
            <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', gap: 2 }}>
              {topLangs.map(l => (
                <div key={l.name} style={{ flex: l.pct, background: langColor(l.name), minWidth: l.pct > 0 ? 4 : 0 }} />
              ))}
            </div>
            {/* Pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {topLangs.map(l => (
                <span key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#374151', background: '#f3f4f6', borderRadius: 99, padding: '3px 10px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColor(l.name), display: 'inline-block', flexShrink: 0 }} />
                  {l.name} {l.pct}%
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 28px', marginTop: 20, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#d1d5db' }}>Generated by GitHub Profile Explorer</span>
        <span style={{ fontSize: 11, color: '#d1d5db' }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
      </div>
    </div>
  )
}
