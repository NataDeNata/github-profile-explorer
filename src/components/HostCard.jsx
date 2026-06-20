import { StarIcon, UsersIcon, CodeBracketIcon, ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { useGithubUser } from '../hooks/useGithubUser'
import { langColor } from '../utils/langColors'
import { formatNumber } from '../utils/format'

const HOST = 'NataDeNata'

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl py-3 px-2">
      <Icon className="w-3.5 h-3.5 text-indigo-400 mb-1" aria-hidden="true" />
      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">{value}</span>
      <span className="text-[10px] text-gray-400 mt-0.5">{label}</span>
    </div>
  )
}

function HostCardSkeleton() {
  return (
    <div className="mt-10 animate-pulse">
      <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
      <div className="h-3 w-52 bg-gray-100 dark:bg-gray-700/60 rounded mb-4" />
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col sm:flex-row gap-6">
        <div className="flex items-start gap-4 shrink-0">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="space-y-2 pt-1">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-24 bg-gray-100 dark:bg-gray-700/60 rounded" />
            <div className="h-3 w-48 bg-gray-100 dark:bg-gray-700/60 rounded" />
            <div className="h-3 w-40 bg-gray-100 dark:bg-gray-700/60 rounded" />
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-700/60" />)}
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map(i => <div key={i} className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-700/60" />)}
          </div>
        </div>
        <div className="w-full sm:w-52 space-y-3">
          <div className="h-20 rounded-xl bg-indigo-50 dark:bg-indigo-900/20" />
          <div className="h-10 rounded-xl bg-indigo-200 dark:bg-indigo-700/40" />
        </div>
      </div>
    </div>
  )
}

export default function HostCard({ onViewProfile }) {
  const { user, repos, languages, loading, error } = useGithubUser(HOST)

  if (loading) return <HostCardSkeleton />
  if (error || !user) return null

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0)
  const topLangs = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang]) => lang)

  const latestRepo = [...repos]
    .filter(r => !r.fork)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] ?? null

  return (
    <div className="mt-10">
      {/* Section header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">
          Meet the Creator
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">The developer behind this app</p>
      </div>

      {/* Horizontal card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col sm:flex-row gap-6 items-start">

        {/* Left — avatar + identity */}
        <div className="flex items-start gap-4 shrink-0">
          <a href={user.html_url} target="_blank" rel="noreferrer" className="shrink-0">
            <img
              src={user.avatar_url}
              alt={user.name || user.login}
              className="w-20 h-20 rounded-full ring-4 ring-indigo-100 dark:ring-indigo-900/50 hover:ring-indigo-300 dark:hover:ring-indigo-600 transition-all"
            />
          </a>
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight">
              {user.name || user.login}
            </h3>
            <p className="text-sm text-indigo-500 dark:text-indigo-400 font-mono mb-1.5">
              @{user.login}
            </p>
            {user.bio && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs line-clamp-2">
                {user.bio}
              </p>
            )}
            {user.location && (
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                <MapPinIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
                {user.location}
              </p>
            )}
          </div>
        </div>

        {/* Middle — stats + languages */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Stat icon={CodeBracketIcon} value={user.public_repos}        label="Repos"     />
            <Stat icon={StarIcon}        value={formatNumber(totalStars)} label="Stars"     />
            <Stat icon={UsersIcon}       value={formatNumber(user.followers)} label="Followers" />
          </div>

          {topLangs.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Top Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topLangs.map(lang => (
                  <span
                    key={lang}
                    className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: langColor(lang) }}
                    />
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — latest project + CTA */}
        <div className="shrink-0 flex flex-col gap-3 w-full sm:w-56">
          {latestRepo && (
            <a
              href={latestRepo.html_url}
              target="_blank"
              rel="noreferrer"
              className="group block bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl px-4 py-3 transition-colors"
            >
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-1">
                Latest Project
              </p>
              <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 truncate group-hover:underline">
                {latestRepo.name}
              </p>
              {latestRepo.description && (
                <p className="text-xs text-indigo-500/80 dark:text-indigo-400/70 mt-0.5 line-clamp-2 leading-relaxed">
                  {latestRepo.description}
                </p>
              )}
            </a>
          )}

          <button
            type="button"
            onClick={() => onViewProfile(HOST)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Explore my full profile
            <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
