import { useState, useMemo, useEffect } from 'react'

const SORT_COMPARATORS = {
  stars:   (a, b) => b.stargazers_count - a.stargazers_count,
  updated: (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
  size:    (a, b) => b.size - a.size,
}

export function useRepoFilters(repos, username) {
  const [search, setSearch]               = useState('')
  const [activeLanguage, setActiveLanguage] = useState(null)
  const [sort, setSort]                   = useState('updated')

  // Reset filters when the user changes so stale state doesn't carry over
  useEffect(() => {
    setSearch('')
    setActiveLanguage(null)
  }, [username])

  // Unique languages ordered by how many repos use them
  const languages = useMemo(() => {
    const counts = {}
    repos.forEach(r => {
      if (r.language) counts[r.language] = (counts[r.language] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang)
  }, [repos])

  const filtered = useMemo(() => {
    let result = repos

    if (activeLanguage) {
      result = result.filter(r => r.language === activeLanguage)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      )
    }

    return [...result].sort(SORT_COMPARATORS[sort])
  }, [repos, activeLanguage, search, sort])

  function toggleLanguage(lang) {
    setActiveLanguage(prev => (prev === lang ? null : lang))
  }

  function clearFilters() {
    setSearch('')
    setActiveLanguage(null)
  }

  return {
    search, setSearch,
    activeLanguage, toggleLanguage,
    sort, setSort,
    clearFilters,
    languages,
    filtered,
    hasActiveFilter: Boolean(search || activeLanguage),
  }
}
