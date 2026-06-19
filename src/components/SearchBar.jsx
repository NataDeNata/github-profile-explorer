import { useState, useEffect } from 'react'

export default function SearchBar({ onSearch, defaultValue = '', placeholder = 'Search GitHub username...' }) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => { setValue(defaultValue) }, [defaultValue])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="GitHub username"
        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        Search
      </button>
    </form>
  )
}
