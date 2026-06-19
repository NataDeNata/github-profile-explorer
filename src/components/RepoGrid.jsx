import { langColor } from '../utils/langColors'
import { formatNumber, formatSize } from '../utils/format'

export default function RepoGrid({ repos, onSelect }) {
  if (!repos.length) return null

  return (
    <div>
      <h3 className="font-semibold mb-4 text-lg">Repositories ({repos.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.map(repo => (
          <button
            key={repo.id}
            type="button"
            onClick={() => onSelect(repo)}
            className="w-full text-left group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col gap-2"
          >
            {/* Name + fork badge */}
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline truncate">
                {repo.name}
              </span>
              {repo.fork && (
                <span className="text-xs text-gray-400 shrink-0 mt-0.5">fork</span>
              )}
            </div>

            {/* Description */}
            {repo.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {repo.description}
              </p>
            )}

            {/* Always-visible: language · stars · forks */}
            <div className="flex items-center gap-3 mt-auto pt-2 text-sm text-gray-500 dark:text-gray-400">
              {repo.language && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: langColor(repo.language) }}
                  />
                  {repo.language}
                </span>
              )}
              {repo.stargazers_count > 0 && (
                <span>{formatNumber(repo.stargazers_count)} stars</span>
              )}
              {repo.forks_count > 0 && (
                <span>{formatNumber(repo.forks_count)} forks</span>
              )}
            </div>

            {/* Revealed on hover: license · size · open issues
                grid-rows-[0fr→1fr] smoothly expands height without a fixed max-h guess.
                The inner div needs min-h-0 so the grid row can actually collapse to 0. */}
            {(repo.license || repo.size > 0 || repo.open_issues_count > 0) && (
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-200">
                <div className="min-h-0 overflow-hidden">
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
                    {repo.license?.spdx_id && (
                      <span>{repo.license.spdx_id} license</span>
                    )}
                    {repo.size > 0 && <span>{formatSize(repo.size)}</span>}
                    {repo.open_issues_count > 0 && (
                      <span>{repo.open_issues_count} open issues</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
