import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useRepoDetails } from '../hooks/useRepoDetails'
import EmptyState from './EmptyState'
import { DocumentTextIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline'

const TABS = ['readme', 'commits', 'contributors']

export default function RepoModal({ repo, onClose }) {
  const [visible, setVisible] = useState(false)
  const [tab, setTab] = useState('readme')
  const closeRef = useRef(null)

  const owner = repo.owner.login
  const { readme, commits, contributors, loading } = useRepoDetails(owner, repo.name)

  // Decode base64 README that GitHub returns
  const readmeContent = readme
    ? atob(readme.content.replace(/\n/g, ''))
    : null

  // Delay setVisible so the browser paints the initial translate-x-full first,
  // giving the CSS transition something to animate from
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    closeRef.current?.focus()
    return () => cancelAnimationFrame(id)
  }, [])

  // Prevent the page behind from scrolling while the drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Escape key closes the drawer
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 300) // matches duration-300 on the drawer
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        role="presentation"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${repo.name} details`}
        className={`relative w-full max-w-2xl h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{repo.name}</h2>
            {repo.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                {repo.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-indigo-500 hover:underline whitespace-nowrap"
            >
              View on GitHub
            </a>
            <button
              ref={closeRef}
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {TABS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="animate-pulse space-y-3 pt-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded"
                  style={{ width: `${[100, 88, 95, 75, 90, 82, 100, 70][i]}%` }}
                />
              ))}
            </div>
          )}

          {!loading && tab === 'readme' && (
            readmeContent
              ? (
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {readmeContent}
                  </ReactMarkdown>
                </div>
              )
              : (
                <EmptyState
                  icon={DocumentTextIcon}
                  title="No README found"
                  description="This repository doesn't have a README yet."
                />
              )
          )}

          {!loading && tab === 'commits' && (
            commits.length
              ? (
                <ul className="space-y-4">
                  {commits.map(c => (
                    <li key={c.sha} className="flex items-start gap-3">
                      {c.author?.avatar_url && (
                        <img
                          src={c.author.avatar_url}
                          alt={c.author.login}
                          className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5"
                          loading="lazy"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {c.commit.message.split('\n')[0]}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {c.commit.author.name}
                          {' · '}
                          {new Date(c.commit.author.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {' · '}
                          <a
                            href={c.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-indigo-400 hover:underline"
                          >
                            {c.sha.slice(0, 7)}
                          </a>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )
              : (
                <EmptyState
                  icon={ClockIcon}
                  title="No commits found"
                  description="There's no commit history available for this repository."
                />
              )
          )}

          {!loading && tab === 'contributors' && (
            contributors.length
              ? (
                <ul className="space-y-3">
                  {contributors.map(c => (
                    <li key={c.id} className="flex items-center gap-3">
                      <img
                        src={c.avatar_url}
                        alt={c.login}
                        className="w-9 h-9 rounded-full"
                        loading="lazy"
                      />
                      <div>
                        <a
                          href={c.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-indigo-500 hover:underline"
                        >
                          {c.login}
                        </a>
                        <p className="text-xs text-gray-400">
                          {c.contributions.toLocaleString()} contributions
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )
              : (
                <EmptyState
                  icon={UsersIcon}
                  title="No contributors found"
                  description="Contributor data isn't available for this repository."
                />
              )
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
