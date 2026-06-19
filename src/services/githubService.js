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

function withCache(key, fn) {
  if (cache.has(key)) return Promise.resolve(cache.get(key))
  return fn().then(data => {
    cache.set(key, data)
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
