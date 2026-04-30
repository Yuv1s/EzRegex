import { useRef } from 'react'
import { buildHighlightedHtml } from '../lib/regexEngine'

export default function EditorPanel({ pattern, testString, error, matches, onPatternChange, onTestStringChange, darkMode }) {
  const backdropRef = useRef(null)
  const textareaRef = useRef(null)

  function syncScroll() {
    if (backdropRef.current && textareaRef.current)
      backdropRef.current.scrollTop = textareaRef.current.scrollTop
  }

  const highlightedHtml = buildHighlightedHtml(testString, matches)

  return (
    <main className="flex-1 flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 overflow-y-auto">
      {/* Regex input */}
      <section className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Regular Expression
        </label>
        <div className="flex items-center gap-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-colors">
          <span className="px-3 py-2.5 text-gray-400 dark:text-gray-500 font-mono text-sm bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 select-none">
            /
          </span>
          <input
            type="text"
            value={pattern}
            onChange={e => onPatternChange(e.target.value)}
            placeholder="Enter your regex here…"
            spellCheck={false}
            autoComplete="off"
            className="flex-1 px-3 py-2.5 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 outline-none"
          />
          <span className="px-3 py-2.5 text-gray-400 dark:text-gray-500 font-mono text-sm bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 select-none">
            /g
          </span>
        </div>

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 font-mono px-1">{error}</p>
        )}

        {/* Plain-English breakdown placeholder */}
        <div className="min-h-10 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-400 dark:text-indigo-500 font-mono">
          Plain-English breakdown will appear here — <span className="opacity-60">TODO</span>
        </div>
      </section>

      {/* Test string with highlight overlay */}
      <section className="flex flex-col gap-2 flex-1">
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Test String
        </label>
        <div className="relative flex-1 min-h-48 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-colors overflow-hidden">
          {/* Highlight backdrop */}
          <div
            ref={backdropRef}
            aria-hidden="true"
            className="absolute inset-0 px-3 py-2.5 font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words overflow-hidden pointer-events-none"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
          {/* Textarea with transparent text so backdrop shows through */}
          <textarea
            ref={textareaRef}
            value={testString}
            onChange={e => onTestStringChange(e.target.value)}
            onScroll={syncScroll}
            placeholder="Paste your test string here…"
            spellCheck={false}
            style={{ caretColor: darkMode ? '#f3f4f6' : '#111827' }}
            className="absolute inset-0 w-full h-full px-3 py-2.5 font-mono text-sm bg-transparent text-transparent placeholder-gray-300 dark:placeholder-gray-600 resize-none outline-none"
          />
        </div>
      </section>
    </main>
  )
}
