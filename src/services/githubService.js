import axios from 'axios'

const client = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(import.meta.env.VITE_GITHUB_TOKEN && {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
    }),
  },
})

// In-memory cache — survives re-renders, resets on page refresh
const cache = new Map()

const LS_PREFIX = 'ghex:'
const LS_TTL = 10 * 60 * 1000 // 10 minutes

function lsGet(key) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > LS_TTL) { localStorage.removeItem(LS_PREFIX + key); return null }
    return data
  } catch { return null }
}

function lsSet(key, data) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, ts: Date.now() }))
  } catch {} // QuotaExceededError — silently skip
}

function withCache(key, fn) {
  if (cache.has(key)) return Promise.resolve(cache.get(key))
  const persisted = lsGet(key)
  if (persisted !== null) { cache.set(key, persisted); return Promise.resolve(persisted) }
  return fn().then(data => {
    cache.set(key, data)
    lsSet(key, data)
    return data
  })
}

export const getUser = (username, signal) =>
  withCache(`user:${username}`, () =>
    client.get(`/users/${username}`, { signal }).then(r => r.data)
  )

export const getRepos = (username, signal) =>
  withCache(`repos:${username}`, () =>
    client
      .get(`/users/${username}/repos`, {
        params: { per_page: 100, sort: 'updated' },
        signal,
      })
      .then(r => r.data)
  )

export const getLanguages = (owner, repo, signal) =>
  withCache(`langs:${owner}/${repo}`, () =>
    client
      .get(`/repos/${owner}/${repo}/languages`, { signal })
      .then(r => r.data)
  )

// 202 means GitHub is still computing stats — caller should retry or treat as unavailable
export const getCommitActivity = (owner, repo, signal) =>
  withCache(`commits:${owner}/${repo}`, () =>
    client
      .get(`/repos/${owner}/${repo}/stats/commit_activity`, { signal })
      .then(r => (r.status === 202 ? null : r.data))
  )

// README content is base64-encoded — caller decodes with atob()
export const getReadme = (owner, repo, signal) =>
  withCache(`readme:${owner}/${repo}`, () =>
    client.get(`/repos/${owner}/${repo}/readme`, { signal }).then(r => r.data)
  )

export const getCommitList = (owner, repo, signal) =>
  withCache(`commit-list:${owner}/${repo}`, () =>
    client
      .get(`/repos/${owner}/${repo}/commits`, {
        params: { per_page: 20 },
        signal,
      })
      .then(r => r.data)
  )

export const getContributors = (owner, repo, signal) =>
  withCache(`contributors:${owner}/${repo}`, () =>
    client
      .get(`/repos/${owner}/${repo}/contributors`, {
        params: { per_page: 10 },
        signal,
      })
      .then(r => r.data)
  )

export const getRepo = (fullName) =>
  withCache(`repo:${fullName}`, () =>
    client.get(`/repos/${fullName}`).then(r => r.data)
  )

export const getTrendingRepos = () => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10)
  return withCache('trending:week', () =>
    client
      .get('/search/repositories', {
        params: { q: `created:>${since}`, sort: 'stars', order: 'desc', per_page: 6 },
      })
      .then(r => ({ items: r.data.items, totalCount: r.data.total_count }))
  )
}

export const getMostStarredRepo = () =>
  withCache('github:top-repo', () =>
    client
      .get('/search/repositories', {
        params: { q: 'stars:>1', sort: 'stars', order: 'desc', per_page: 1 },
      })
      .then(r => r.data.items[0])
  )

// Fire-and-forget: warms the cache for all RepoModal tabs so opening feels instant
export function prefetchRepo(owner, repo) {
  getReadme(owner, repo).catch(() => {})
  getCommitList(owner, repo).catch(() => {})
  getContributors(owner, repo).catch(() => {})
}

// Fetches up to 300 public events (~90 days). Individual page failures return [].
export const getUserEvents = (username, signal) =>
  withCache(`events:${username}`, async () => {
    const fetchPage = (page) =>
      client
        .get(`/users/${username}/events/public`, {
          params: { per_page: 100, page },
          signal,
        })
        .then(r => r.data)
        .catch(() => [])

    const pages = await Promise.all([fetchPage(1), fetchPage(2), fetchPage(3)])
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return pages.flat()
  })
