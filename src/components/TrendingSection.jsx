import { StarIcon, ArrowTopRightOnSquareIcon, FireIcon } from '@heroicons/react/24/outline'
import { langColor } from '../utils/langColors'
import { useTrending } from '../hooks/useTrending'

function fmtNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

function daysOld(created_at) {
  return Math.floor((Date.now() - new Date(created_at)) / (1000 * 60 * 60 * 24))
}

function RepoCard({ repo }) {
  const age = daysOld(repo.created_at)
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all min-h-[148px]"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <img
          src={repo.owner.avatar_url}
          alt={repo.owner.login}
          className="w-5 h-5 rounded-full shrink-0"
        />
        <span className="text-xs text-gray-400 truncate">{repo.owner.login}</span>
        <ArrowTopRightOnSquareIcon className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 ml-auto shrink-0 transition-colors" />
      </div>

      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
        {repo.name}
      </h4>

      {repo.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 flex-1 leading-relaxed">
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/50">
        {repo.language && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: langColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400 ml-auto">
          <StarIcon className="w-3 h-3 text-amber-400 shrink-0" />
          {fmtNum(repo.stargazers_count)}
        </span>
        <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0 pl-1 border-l border-gray-200 dark:border-gray-700">
          {age === 0 ? 'today' : `${age}d old`}
        </span>
      </div>
    </a>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 animate-pulse min-h-[148px] flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-full bg-gray-100 dark:bg-gray-700/60 rounded" />
      <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-700/60 rounded" />
      <div className="flex items-center gap-2 mt-auto pt-2">
        <div className="h-3 w-12 bg-gray-100 dark:bg-gray-700/60 rounded" />
        <div className="h-3 w-10 bg-gray-100 dark:bg-gray-700/60 rounded ml-auto" />
      </div>
    </div>
  )
}

function StatPill({ icon, value, label, href }) {
  const inner = (
    <div className="bg-white dark:bg-gray-800 rounded-xl px-5 py-3.5 shadow-sm flex items-center gap-3 h-full">
      <span className="shrink-0 flex items-center">{icon}</span>
      <div className="min-w-0">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">
          {value}
        </div>
        <div className="text-xs text-gray-400 truncate">{label}</div>
      </div>
    </div>
  )
  return href
    ? <a href={href} target="_blank" rel="noreferrer" className="block border border-transparent hover:border-indigo-400 rounded-xl transition-colors">{inner}</a>
    : <div>{inner}</div>
}

function SkeletonPill() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl px-5 py-3.5 shadow-sm animate-pulse flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex flex-col gap-1.5">
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-32 bg-gray-100 dark:bg-gray-700/60 rounded" />
      </div>
    </div>
  )
}

export default function TrendingSection() {
  const { data, loading } = useTrending()

  if (!loading && !data) return null

  const items = data?.trending?.items ?? []
  const totalCount = data?.trending?.totalCount ?? 0
  const topRepo = data?.topRepo ?? null

  const langCounts = {}
  items.forEach(r => {
    if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1
  })
  const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">
            Trending on GitHub
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Repos born this week with the fastest-rising stars
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonPill key={i} />)
        ) : (
          <>
            <StatPill
              icon={<FireIcon className="w-6 h-6 text-orange-500" />}
              value={fmtNum(totalCount)}
              label="new repos created this week"
            />
            {topRepo && (
              <StatPill
                icon={<StarIcon className="w-6 h-6 text-amber-400" />}
                value={fmtNum(topRepo.stargazers_count)}
                label={`all-time most starred · ${topRepo.name}`}
                href={topRepo.html_url}
              />
            )}
            {topLang && (
              <StatPill
                icon={<span className="w-5 h-5 rounded-full inline-block" style={{ background: langColor(topLang) }} />}
                value={topLang}
                label="hottest language this week"
              />
            )}
          </>
        )}
      </div>

      {/* Repo grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(repo => <RepoCard key={repo.id} repo={repo} />)
        }
      </div>
    </div>
  )
}
