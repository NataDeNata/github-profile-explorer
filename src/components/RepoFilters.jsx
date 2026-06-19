import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { langColor } from '../utils/langColors'

const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'stars',   label: 'Most Stars' },
  { value: 'size',    label: 'Largest Codebase' },
]

export default function RepoFilters({
  search, onSearch,
  activeLanguage, onToggleLanguage,
  sort, onSort,
  languages,
  hasActiveFilter, onClear,
}) {
  return (
    <div className="space-y-3 mb-6">
      {/* Search input + sort dropdown */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search repositories…"
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={sort}
          onChange={e => onSort(e.target.value)}
          aria-label="Sort repositories"
          className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Language pill filters */}
      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {languages.map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => onToggleLanguage(lang)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeLanguage === lang
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: langColor(lang) }}
                aria-hidden="true"
              />
              {lang}
            </button>
          ))}

          {hasActiveFilter && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
