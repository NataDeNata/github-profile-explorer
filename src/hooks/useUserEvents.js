import { useState, useEffect } from 'react'
import { getUserEvents } from '../services/githubService'

export function useUserEvents(username) {
  const [commitsByDay, setCommitsByDay] = useState({})
  const [commitsByHour, setCommitsByHour] = useState(Array(24).fill(0))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!username) {
      setCommitsByDay({})
      setCommitsByHour(Array(24).fill(0))
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    getUserEvents(username, controller.signal)
      .then(events => {
        const byDay = {}
        const byHour = Array(24).fill(0)

        events
          .filter(e => e.type === 'PushEvent')
          .forEach(e => {
            const date = e.created_at.slice(0, 10)
            const hour = new Date(e.created_at).getUTCHours()
            const count = e.payload?.size ?? 1

            byDay[date] = (byDay[date] || 0) + count
            byHour[hour] = byHour[hour] + count
          })

        setCommitsByDay(byDay)
        setCommitsByHour(byHour)
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          setCommitsByDay({})
          setCommitsByHour(Array(24).fill(0))
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [username])

  return { commitsByDay, commitsByHour, loading }
}
