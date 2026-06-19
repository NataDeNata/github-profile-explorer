import { useState, useEffect } from 'react'
import { getTrendingRepos, getMostStarredRepo } from '../services/githubService'

export function useTrending() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([getTrendingRepos(), getMostStarredRepo()])
      .then(([trending, topRepo]) => {
        if (!cancelled) {
          setData({ trending, topRepo })
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { data, loading }
}
