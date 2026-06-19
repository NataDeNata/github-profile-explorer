import { useState, useEffect } from 'react'
import axios from 'axios'
import { getUser, getRepos, getLanguages } from '../services/githubService'

export function useGithubUser(username) {
  const [user, setUser] = useState(null)
  const [repos, setRepos] = useState([])
  const [languages, setLanguages] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username) return

    const controller = new AbortController()
    const { signal } = controller

    async function fetchAll() {
      setLoading(true)
      setError(null)
      setUser(null)
      setRepos([])
      setLanguages({})

      try {
        const userData = await getUser(username, signal)
        if (signal.aborted) return
        setUser(userData)

        const reposData = await getRepos(username, signal)
        if (signal.aborted) return
        setRepos(reposData)

        // Only fetch languages for non-fork repos that have code
        const ownRepos = reposData.filter(r => !r.fork && r.size > 0)

        // allSettled so a single failed repo doesn't abort the whole aggregation
        const langResults = await Promise.allSettled(
          ownRepos.map(r => getLanguages(r.owner.login, r.name, signal))
        )
        if (signal.aborted) return

        const aggregated = langResults.reduce((acc, result) => {
          if (result.status !== 'fulfilled' || !result.value) return acc
          Object.entries(result.value).forEach(([lang, bytes]) => {
            acc[lang] = (acc[lang] || 0) + bytes
          })
          return acc
        }, {})

        setLanguages(aggregated)
      } catch (err) {
        if (axios.isCancel(err) || signal.aborted) return

        if (err.response?.status === 404) {
          setError({ type: 'not_found', message: `User "${username}" not found.` })
        } else if (err.response?.status === 403) {
          setError({ type: 'rate_limit', message: 'GitHub API rate limit reached. Try again later.' })
        } else {
          setError({ type: 'unknown', message: 'Something went wrong. Please try again.' })
        }
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }

    fetchAll()
    return () => controller.abort()
  }, [username])

  return { user, repos, languages, loading, error }
}
