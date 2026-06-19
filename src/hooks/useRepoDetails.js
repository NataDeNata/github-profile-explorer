import { useState, useEffect } from 'react'
import { getReadme, getCommitList, getContributors } from '../services/githubService'

export function useRepoDetails(owner, repo) {
  const [readme, setReadme] = useState(null)
  const [commits, setCommits] = useState([])
  const [contributors, setContributors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!owner || !repo) return

    const controller = new AbortController()
    const { signal } = controller

    setLoading(true)
    setReadme(null)
    setCommits([])
    setContributors([])

    // All three fire in parallel — allSettled means one failing doesn't block the others
    Promise.allSettled([
      getReadme(owner, repo, signal),
      getCommitList(owner, repo, signal),
      getContributors(owner, repo, signal),
    ]).then(([readmeRes, commitsRes, contributorsRes]) => {
      if (signal.aborted) return
      if (readmeRes.status === 'fulfilled') setReadme(readmeRes.value)
      if (commitsRes.status === 'fulfilled') setCommits(commitsRes.value)
      if (contributorsRes.status === 'fulfilled') setContributors(contributorsRes.value)
      setLoading(false)
    })

    return () => controller.abort()
  }, [owner, repo])

  return { readme, commits, contributors, loading }
}
