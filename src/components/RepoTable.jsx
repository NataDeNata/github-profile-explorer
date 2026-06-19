import { StarIcon } from '@heroicons/react/20/solid'
import { langColor } from '../utils/langColors'
import { formatNumber, formatRelativeTime } from '../utils/format'

function LangBadge({ language }) {
  if (!language) return <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: langColor(language) }}
        aria-hidden="true"
      />
      {language}
    </span>
  )
}

const ROW = 'flex items-center gap-4 px-4'

export default function RepoTable({ repos, onSelect, title }) {
  if (!repos.length) return null

  return (
    <section aria-label={title ?? 'Repositories'}>
      <h3 className="font-semibold text-lg mb-4">
        {title ?? 'Repositories'}{' '}
        <span className="text-gray-400 font-normal text-base">({repos.length})</span>
      </h3>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Column headers */}
        <div className={`${ROW} py-2 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-400 uppercase tracking-wide`}>
          <div className="flex-1 min-w-0">Repository</div>
          <div className="hidden sm:block w-28 shrink-0">Language</div>
          <div className="w-14 shrink-0 text-right">Stars</div>
          <div className="hidden sm:block w-20 shrink-0 text-right">Updated</div>
        </div>

        <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
          {repos.map(repo => (
            <li key={repo.id}>
              <button
                type="button"
                onClick={() => onSelect(repo)}
                className={`${ROW} w-full py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group`}
              >
                {/* Name + description */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline truncate block">
                    {repo.name}
                  </span>
                  {repo.description && (
                    <span className="text-xs text-gray-400 truncate block mt-0.5">
                      {repo.description}
                    </span>
                  )}
                </div>

                {/* Language */}
                <div className="hidden sm:block w-28 shrink-0">
                  <LangBadge language={repo.language} />
                </div>

                {/* Stars */}
                <div className="w-14 shrink-0 text-right">
                  {repo.stargazers_count > 0 ? (
                    <span className="inline-flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <StarIcon className="w-3 h-3 text-amber-400" aria-hidden="true" />
                      {formatNumber(repo.stargazers_count)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                  )}
                </div>

                {/* Updated */}
                <div className="hidden sm:block w-20 shrink-0 text-right text-xs text-gray-400">
                  {formatRelativeTime(repo.updated_at)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
