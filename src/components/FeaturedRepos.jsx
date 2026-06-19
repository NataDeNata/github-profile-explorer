import { StarIcon } from '@heroicons/react/24/solid'
import { langColor } from '../utils/langColors'
import { formatNumber } from '../utils/format'

function FeaturedCard({ repo, onSelect, onPrefetch }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(repo)}
      onMouseEnter={() => onPrefetch?.(repo.owner.login, repo.name)}
      className="w-full text-left group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-t-2 border-indigo-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 transition-all duration-200 flex flex-col gap-3"
    >
      {/* Name + star count */}
      <div className="flex items-start justify-between gap-3">
        <span className="font-semibold text-base text-indigo-600 dark:text-indigo-400 group-hover:underline leading-snug">
          {repo.name}
        </span>
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1 text-amber-500 text-sm font-medium shrink-0">
            <StarIcon className="w-4 h-4" aria-hidden="true" />
            {formatNumber(repo.stargazers_count)}
          </span>
        )}
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">
          {repo.description}
        </p>
      )}

      {/* Footer: language · forks · fork badge */}
      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-auto">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: langColor(repo.language) }}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span>{formatNumber(repo.forks_count)} forks</span>
        )}
        {repo.fork && <span>fork</span>}
      </div>
    </button>
  )
}

export default function FeaturedRepos({ repos, onSelect, onPrefetch }) {
  if (!repos.length) return null

  return (
    <section aria-label="Featured repositories" className="mb-10">
      <h3 className="font-semibold text-lg mb-4">Featured</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {repos.map(repo => (
          <FeaturedCard key={repo.id} repo={repo} onSelect={onSelect} onPrefetch={onPrefetch} />
        ))}
      </div>
    </section>
  )
}
