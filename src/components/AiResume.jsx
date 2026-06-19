import { useState } from 'react'
import { SparklesIcon, ArrowPathIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mt-4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

export default function AiResume({ user, repos, languages }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  async function generate() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, repos, languages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  function copyText() {
    if (!result) return
    const full = [result.paragraph1, result.paragraph2, result.paragraph3].join('\n\n')
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mt-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-indigo-500" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Profile Summary</h2>
        </div>
        <div className="flex items-center gap-2">
          {status === 'done' && (
            <button
              type="button"
              onClick={copyText}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {copied
                ? <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                : <ClipboardDocumentIcon className="w-3.5 h-3.5" />
              }
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          <button
            type="button"
            onClick={generate}
            disabled={status === 'loading'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              status === 'loading'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-400 cursor-not-allowed'
                : status === 'done'
                  ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
            }`}
          >
            {status === 'loading' ? (
              <>
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                Generating…
              </>
            ) : status === 'done' ? (
              <>
                <ArrowPathIcon className="w-3.5 h-3.5" aria-hidden="true" />
                Regenerate
              </>
            ) : (
              <>
                <SparklesIcon className="w-3.5 h-3.5" aria-hidden="true" />
                Generate Dev Resume
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {status === 'idle' && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Generate a professional AI summary of{' '}
            <span className="font-medium text-gray-600 dark:text-gray-400">@{user.login}</span>
            's strengths based on their repos and languages.
          </p>
        )}

        {status === 'loading' && <Skeleton />}

        {status === 'error' && (
          <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
            <span className="font-semibold">Error:</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {status === 'done' && result && (
          <div className="space-y-4">
            {/* Project Spotlight callout */}
            {result.spotlight && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wide">
                  Project Spotlight
                </p>
                <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed italic">
                  "{result.spotlight}"
                </p>
              </div>
            )}

            {/* Paragraphs */}
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.paragraph1}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.paragraph2}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.paragraph3}</p>

            {/* Footer attribution */}
            <div className="pt-1 flex items-center justify-end gap-1.5">
              <SparklesIcon className="w-3 h-3 text-gray-300 dark:text-gray-600" aria-hidden="true" />
              <span className="text-xs text-gray-300 dark:text-gray-600">Powered by Gemini 2.5 Flash</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
