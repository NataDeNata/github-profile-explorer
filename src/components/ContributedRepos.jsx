import { StarIcon, CodeBracketIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

function fmtNum(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function RepoCard({ repo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 truncate">{repo.owner.login}</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{repo.name}</p>
        </div>
        <span className="shrink-0 flex items-center gap-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
          <ArrowTrendingUpIcon className="w-3 h-3" aria-hidden="true" />
          {repo.contributionCount} {repo.contributionCount === 1 ? 'commit' : 'commits'}
        </span>
      </div>

      {repo.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-400">
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <StarIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {fmtNum(repo.stargazers_count)}
          </span>
        )}
        {repo.language && (
          <span className="flex items-center gap-1">
            <CodeBracketIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {repo.language}
          </span>
        )}
      </div>
    </a>
  )
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm animate-pulse">
          <div className="flex justify-between mb-2">
            <div className="space-y-1.5 flex-1 mr-4">
              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          <div className="space-y-1.5 mb-3">
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded" />
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded w-1/4" />
        </div>
      ))}
    </div>
  )
}

export default function ContributedRepos({ repos, loading }) {
  if (!loading && repos.length === 0) return null

  return (
    <div className="mt-10">
      <div className="flex items-baseline gap-2 mb-4">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">
          External Contributions
        </h2>
        <span className="text-xs text-gray-400">push activity · last 90 days</span>
      </div>

      {loading ? <Skeleton /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {repos.map(repo => <RepoCard key={repo.full_name} repo={repo} />)}
        </div>
      )}
    </div>
  )
}
