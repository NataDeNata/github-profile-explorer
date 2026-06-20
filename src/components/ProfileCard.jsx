import { useRef, useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { ArrowDownTrayIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import SnapshotCard from './SnapshotCard'

export default function ProfileCard({ user, repoCount, repos = [], languages = {} }) {
  const snapshotRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (downloading || !snapshotRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(snapshotRef.current, { pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${user.login}-github-card.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download card failed:', err)
      alert('Could not generate image. Check the console for details.')
    } finally {
      setDownloading(false)
    }
  }, [user, downloading])

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm flex gap-4 sm:gap-6 items-start">
        <img
          src={user.avatar_url}
          alt={user.name || user.login}
          loading="lazy"
          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{user.name || user.login}</h2>
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-500 hover:underline text-sm"
              >
                @{user.login}
              </a>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              title="Download stats card as PNG"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 shrink-0"
            >
              <ArrowDownTrayIcon className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{downloading ? 'Generating…' : 'Download Card'}</span>
            </button>
          </div>

          {user.bio && (
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm line-clamp-2 sm:line-clamp-none">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-600 dark:text-gray-400">
            <span>
              <strong className="text-gray-900 dark:text-gray-100">
                {user.followers.toLocaleString()}
              </strong>{' '}
              followers
            </span>
            <span>
              <strong className="text-gray-900 dark:text-gray-100">
                {user.following.toLocaleString()}
              </strong>{' '}
              following
            </span>
            <span>
              <strong className="text-gray-900 dark:text-gray-100">{repoCount}</strong> repos
            </span>
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {user.location}
              </span>
            )}
            {user.company && (
              <span className="flex items-center gap-1">
                <BuildingOfficeIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {user.company}
              </span>
            )}
            {user.blog && (
              <a
                href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-500 hover:underline truncate max-w-[200px]"
              >
                {user.blog}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Off-screen wrapper — ref targets the inner card so position offset isn't cloned into the SVG */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }}>
        <SnapshotCard
          forwardRef={snapshotRef}
          user={user}
          repos={repos}
          languages={languages}
          avatarSrc={user.avatar_url}
        />
      </div>
    </>
  )
}
