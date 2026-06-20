import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGithubUser } from './hooks/useGithubUser'
import { useRepoFilters } from './hooks/useRepoFilters'
import { useDarkMode } from './hooks/useDarkMode'
import { useUserEvents } from './hooks/useUserEvents'
import { useContributedRepos } from './hooks/useContributedRepos'
import { getCommitActivity } from './services/githubService'
import { MagnifyingGlassIcon, ClockIcon, ExclamationTriangleIcon, FunnelIcon, SunIcon, MoonIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import SearchBar from './components/SearchBar'
import ProfileCard from './components/ProfileCard'
import ProfileCardSkeleton from './components/ProfileCardSkeleton'
import RepoGridSkeleton from './components/RepoGridSkeleton'
import FeaturedRepos from './components/FeaturedRepos'
import RepoTable from './components/RepoTable'
import RepoFilters from './components/RepoFilters'
import RepoModal from './components/RepoModal'
import EmptyState from './components/EmptyState'
import LanguageChart from './components/LanguageChart'
import CommitActivityChart from './components/CommitActivityChart'
import StarsChart from './components/StarsChart'
import CommitHeatmap from './components/CommitHeatmap'
import PeakHoursChart from './components/PeakHoursChart'
import RepoScatterChart from './components/RepoScatterChart'
import VsMode from './components/VsMode'
import AiResume from './components/AiResume'
import ContributedRepos from './components/ContributedRepos'
import FeaturedProfiles from './components/FeaturedProfiles'
import TrendingSection from './components/TrendingSection'
import HostCard from './components/HostCard'
import { prefetchRepo } from './services/githubService'

const LANDING_PHRASES = [
  "Search a developer's profile...",
  "Type any GitHub username...",
  "Explore a repository...",
  "Explore any developer's open-source impact, star history, and more.",
]

function App() {
  const [dark, setDark] = useDarkMode()
  const [searchParams, setSearchParams] = useSearchParams()
  const [username, setUsername] = useState(() => searchParams.get('user') ?? '')
  const { user, repos, languages, loading, error } = useGithubUser(username)
  const { commitsByDay, commitsByHour, loading: eventsLoading } = useUserEvents(username)
  const { repos: contributedRepos, loading: contributedLoading } = useContributedRepos(username)

  const [showCompareTip, setShowCompareTip] = useState(
    () => !localStorage.getItem('ghex:compare-tip-seen')
  )

  function dismissCompareTip() {
    setShowCompareTip(false)
    localStorage.setItem('ghex:compare-tip-seen', '1')
  }

  const [compareMode, setCompareMode] = useState(() => Boolean(searchParams.get('vs')))
  const [username2, setUsername2] = useState(() => searchParams.get('vs') ?? '')
  const { user: user2, repos: repos2, languages: languages2, loading: loading2, error: error2 } = useGithubUser(username2)

  const compareRef = useRef(null)
  const scrollOnLoad2 = useRef(false)

  // Auto-dismiss the compare tooltip 5 s after the first profile loads
  useEffect(() => {
    if (!user || !showCompareTip) return
    const t = setTimeout(dismissCompareTip, 5000)
    return () => clearTimeout(t)
  }, [user, showCompareTip])

  // Scroll to the comparison section once user2 (or an error) resolves after an explicit search
  useEffect(() => {
    if (!scrollOnLoad2.current) return
    if (loading2) return
    scrollOnLoad2.current = false
    compareRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading2])

  function handleSearch(name) {
    setUsername(name)
    const params = name ? { user: name } : {}
    if (compareMode && username2) params.vs = username2
    setSearchParams(params, { replace: true })
  }

  function handleCompareSearch(name) {
    scrollOnLoad2.current = true
    setUsername2(name)
    const params = username ? { user: username } : {}
    if (name) params.vs = name
    setSearchParams(params, { replace: true })
  }

  function toggleCompare() {
    const next = !compareMode
    setCompareMode(next)
    if (!next) {
      setUsername2('')
      setSearchParams(username ? { user: username } : {}, { replace: true })
    }
  }
  const {
    search, setSearch,
    activeLanguage, toggleLanguage,
    sort, setSort,
    clearFilters,
    languages: filterLanguages,
    filtered,
    hasActiveFilter,
  } = useRepoFilters(repos, username)
  // Top 4 by stars — always fixed, not affected by filters
  const featured = useMemo(
    () => [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 4),
    [repos]
  )
  const featuredIds = useMemo(() => new Set(featured.map(r => r.id)), [featured])

  // When a filter is active show all matched repos; otherwise exclude featured to avoid duplication
  const directoryRepos = hasActiveFilter
    ? filtered
    : filtered.filter(r => !featuredIds.has(r.id))

  const [commitData, setCommitData] = useState(null)
  const [loadingCommits, setLoadingCommits] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState(null)

  // Reset commit state whenever we start a new search
  useEffect(() => {
    setCommitData(null)
    setLoadingCommits(false)
  }, [username])

  // Fetch commit activity for the most-starred repo once repos have loaded
  useEffect(() => {
    if (!repos.length || !user) return

    const topRepo = [...repos].sort(
      (a, b) => b.stargazers_count - a.stargazers_count
    )[0]

    let cancelled = false
    setLoadingCommits(true)

    getCommitActivity(user.login, topRepo.name)
      .then(data => {
        if (!cancelled) {
          // null means GitHub returned 202 (still computing) → treat as unavailable
          setCommitData(data ?? false)
          setLoadingCommits(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCommitData(false)
          setLoadingCommits(false)
        }
      })

    return () => { cancelled = true }
  }, [repos, user])

  const topRepo = repos.length
    ? [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0]
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="max-w-6xl mx-auto px-4 pt-8 sm:pt-10 pb-6">
        <div className="flex items-center justify-between gap-2 mb-6 sm:grid sm:grid-cols-[1fr_auto_1fr]">
          <div className="hidden sm:block" />
          <h1 className="text-2xl sm:text-4xl font-bold text-center">
            <button
              type="button"
              onClick={() => handleSearch('')}
              className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              GitHub Profile Explorer
            </button>
          </h1>
          <div className="flex items-center gap-2 justify-end">
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { dismissCompareTip(); toggleCompare() }}
                  aria-label={compareMode ? 'Exit compare mode' : 'Compare two profiles'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    compareMode
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <ArrowsRightLeftIcon className="w-4 h-4" aria-hidden="true" />
                  {compareMode ? 'Exit VS' : 'Compare'}
                </button>

                {showCompareTip && !compareMode && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="relative bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-700" />
                      Compare two developers side by side!
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setDark(d => !d)}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {dark
                ? <SunIcon className="w-5 h-5" aria-hidden="true" />
                : <MoonIcon className="w-5 h-5" aria-hidden="true" />
              }
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            onSearch={handleSearch}
            defaultValue={username}
            wide={!username}
            typedPlaceholder={!username ? LANDING_PHRASES : ''}
          />
          {compareMode && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-black text-gray-300 dark:text-gray-600 select-none shrink-0">VS</span>
              <SearchBar
                onSearch={handleCompareSearch}
                defaultValue={searchParams.get('vs') ?? ''}
                placeholder="Compare with username..."
                wide
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        {!username && (
          <>
            <FeaturedProfiles onSelect={handleSearch} />
            <TrendingSection />
            <HostCard onViewProfile={handleSearch} />
          </>
        )}

        {loading && (
          <>
            <ProfileCardSkeleton />
            {/* Charts skeleton — three equal-height placeholder cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm h-48 flex items-center justify-center animate-pulse"
                >
                  <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
            <div className="mt-8">
              <RepoGridSkeleton />
            </div>
          </>
        )}

        {error && (
          <div className="mt-16 flex flex-col items-center text-center">
            {error.type === 'not_found' && (
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" aria-hidden="true" />
            )}
            {error.type === 'rate_limit' && (
              <ClockIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" aria-hidden="true" />
            )}
            {error.type === 'unknown' && (
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" aria-hidden="true" />
            )}
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {error.type === 'not_found'
                ? 'User not found'
                : error.type === 'rate_limit'
                  ? 'API rate limit reached'
                  : 'Something went wrong'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              {error.message}
            </p>
          </div>
        )}

        {user && !loading && (
          <>
            <ProfileCard user={user} repoCount={repos.length} repos={repos} languages={languages} />

            <AiResume user={user} repos={repos} languages={languages} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <LanguageChart languages={languages} />
              <CommitActivityChart
                data={commitData}
                loading={loadingCommits}
                repoName={topRepo?.name}
              />
              <StarsChart repos={repos} />
            </div>

            <div className="mt-8">
              {/* Featured: top 4 by stars — hidden when a filter is active */}
              {!hasActiveFilter && (
                <FeaturedRepos repos={featured} onSelect={setSelectedRepo} onPrefetch={prefetchRepo} />
              )}

              {/* Filter bar + directory */}
              <RepoFilters
                search={search} onSearch={setSearch}
                activeLanguage={activeLanguage} onToggleLanguage={toggleLanguage}
                sort={sort} onSort={setSort}
                languages={filterLanguages}
                hasActiveFilter={hasActiveFilter}
                onClear={clearFilters}
              />

              {directoryRepos.length === 0 ? (
                <EmptyState
                  icon={FunnelIcon}
                  title={
                    activeLanguage
                      ? `No ${activeLanguage} repositories`
                      : 'No repositories match'
                  }
                  description={
                    activeLanguage
                      ? `${user.login} hasn't pushed any ${activeLanguage} code yet.`
                      : 'Try a different search term.'
                  }
                  action={{ label: 'Clear filters', onClick: clearFilters }}
                />
              ) : (
                <RepoTable
                  repos={directoryRepos}
                  onSelect={setSelectedRepo}
                  onPrefetch={prefetchRepo}
                  title={hasActiveFilter ? 'Results' : 'All Repositories'}
                />
              )}
            </div>

            <ContributedRepos repos={contributedRepos} loading={contributedLoading} />

            {/* Developer DNA */}
            <div className="mt-10">
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">Developer DNA</h2>
              <CommitHeatmap commitsByDay={commitsByDay} loading={eventsLoading} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <PeakHoursChart commitsByHour={commitsByHour} loading={eventsLoading} />
                <RepoScatterChart repos={repos} />
              </div>
            </div>

            {/* VS Compare */}
            {compareMode && (
              <div ref={compareRef} className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-6">
                  Profile Comparison
                </h2>
                {!username2 && (
                  <p className="text-sm text-gray-400">
                    Enter a second GitHub username in the search bar above to start comparing.
                  </p>
                )}
                {username2 && loading2 && <ProfileCardSkeleton />}
                {username2 && !loading2 && error2 && (
                  <div className="flex flex-col items-center text-center py-10">
                    <MagnifyingGlassIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" aria-hidden="true" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {error2.type === 'not_found' ? `"${username2}" not found` : error2.message}
                    </p>
                  </div>
                )}
                {username2 && !loading2 && user2 && (
                  <VsMode
                    user1={user}   repos1={repos}   languages1={languages}
                    user2={user2}  repos2={repos2}  languages2={languages2}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {selectedRepo && (
        <RepoModal
          repo={selectedRepo}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </div>
  )
}

export default App
