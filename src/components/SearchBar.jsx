import { useState, useEffect, useRef } from 'react'

const CHAR_DELAY  = 42    // ms per character while typing
const START_DELAY = 700   // ms before the very first phrase begins
const HOLD_DELAY  = 2000  // ms to hold after a phrase finishes
const NEXT_DELAY  = 400   // ms gap before the next phrase starts

export default function SearchBar({
  onSearch,
  defaultValue = '',
  placeholder = 'Search GitHub username...',
  typedPlaceholder = '', // string | string[]
  wide = false,
}) {
  const [value, setValue] = useState(defaultValue)
  const [focused, setFocused] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const timeoutRef = useRef(null)

  useEffect(() => { setValue(defaultValue) }, [defaultValue])
  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  // Normalize to array
  const phrases = Array.isArray(typedPlaceholder)
    ? typedPlaceholder
    : typedPlaceholder ? [typedPlaceholder] : []

  // Stable string key — effect only re-runs when the phrase content actually changes
  const phrasesKey = phrases.join('\x00')

  useEffect(() => {
    clearTimeout(timeoutRef.current)
    if (!phrases.length) { setDisplayText(''); return }

    let idx = 0

    function startPhrase() {
      const phrase = phrases[idx % phrases.length]
      let charIdx = 0
      setDisplayText('')

      function typeNext() {
        charIdx += 1
        setDisplayText(phrase.slice(0, charIdx))
        if (charIdx < phrase.length) {
          timeoutRef.current = setTimeout(typeNext, CHAR_DELAY)
        } else {
          // Fully typed — hold, then clear and start the next phrase
          timeoutRef.current = setTimeout(() => {
            idx += 1
            startPhrase()
          }, HOLD_DELAY)
        }
      }

      timeoutRef.current = setTimeout(typeNext, idx === 0 ? START_DELAY : NEXT_DELAY)
    }

    startPhrase()
    return () => clearTimeout(timeoutRef.current)
  }, [phrasesKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSearch(trimmed)
  }

  const showOverlay = phrases.length > 0 && !value && !focused

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${wide ? 'w-full' : 'max-w-md'}`}>
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={showOverlay ? '' : placeholder}
          aria-label="GitHub username"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {showOverlay && (
          <div
            className="absolute inset-0 flex items-center px-4 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <span className="text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {displayText}
              <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>
            </span>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        Search
      </button>
    </form>
  )
}
