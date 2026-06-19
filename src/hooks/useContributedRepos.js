import { useState, useEffect } from 'react'
import { getUserEvents, getRepo } from '../services/githubService'

export function useContributedRepos(username) {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!username) {
      setRepos([])
      return
    }

    const controller = new AbortController()
    setLoading(true)

    getUserEvents(username, controller.signal)
      .then(events => {
        // Tally push events to repos the user doesn't own
        const tally = {}
        events
          .filter(e => e.type === 'PushEvent')
          .forEach(e => {
            const owner = e.repo.name.split('/')[0]
            if (owner.toLowerCase() !== username.toLowerCase()) {
              tally[e.repo.name] = (tally[e.repo.name] || 0) + (e.payload?.size ?? 1)
            }
          })

        const top = Object.entries(tally)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)

        if (!top.length) return []

        return Promise.all(
          top.map(([fullName, count]) =>
            getRepo(fullName)
              .then(r => ({ ...r, contributionCount: count }))
              .catch(() => null)
          )
        )
      })
      .then(results => {
        if (controller.signal.aborted) return
        setRepos((results || []).filter(Boolean))
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          setRepos([])
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [username])

  return { repos, loading }
}
