import { useState, useEffect } from 'react'
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { langColor } from '../utils/langColors'
import { formatNumber, formatRelativeTime } from '../utils/format'

const PAGE_SIZE = 9

function RepoCard({ repo, onSelect, onPrefetch }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(repo)}
      onMouseEnter={() => onPrefetch?.(repo.owner.login, repo.name)}
      className="w-full text-left group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 flex flex-col gap-2 min-h-[110px]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 group-hover:underline leading-snug truncate">
          {repo.name}
        </span>
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-0.5 text-amber-500 text-xs font-medium shrink-0">
            <StarIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {formatNumber(repo.stargazers_count)}
          </span>
        )}
      </div>

      {repo.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 flex-1 leading-relaxed">
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-400 dark:text-gray-500">
        {repo.language ? (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: langColor(repo.language) }}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        ) : (
          <span className="text-gray-300 dark:text-gray-600">—</span>
        )}
        <span className="ml-auto">{formatRelativeTime(repo.updated_at)}</span>
        {repo.fork && (
          <span className="text-gray-300 dark:text-gray-600 pl-2 border-l border-gray-200 dark:border-gray-700">
            fork
          </span>
        )}
      </div>
    </button>
  )
}

function buildPages(page, totalPages) {
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }
  return pages
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = buildPages(page, totalPages)

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1.5 text-gray-400 text-sm select-none">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`min-w-[2rem] h-8 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function RepoTable({ repos, onSelect, onPrefetch, title }) {
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [repos])

  if (!repos.length) return null

  const totalPages = Math.ceil(repos.length / PAGE_SIZE)
  const paged = repos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, repos.length)

  return (
    <section aria-label={title ?? 'Repositories'}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          {title ?? 'Repositories'}{' '}
          <span className="text-gray-400 font-normal text-base">({repos.length})</span>
        </h3>
        {totalPages > 1 && (
          <span className="text-xs text-gray-400">
            {start}–{end} of {repos.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {paged.map(repo => (
          <RepoCard
            key={repo.id}
            repo={repo}
            onSelect={onSelect}
            onPrefetch={onPrefetch}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
  )
}
