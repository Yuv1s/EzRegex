import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { buildHighlightedHtml } from '../lib/regexEngine'
import { summarizeRegex } from '../lib/regexExplainer'

const FLAG_META = [
  { flag: 'g', tip: 'global - find all matches' },
  { flag: 'i', tip: 'case insensitive' },
  { flag: 'm', tip: 'multiline - ^ and $ match line boundaries' },
  { flag: 's', tip: 'dotAll - . matches newlines too' },
]

function FlagPill({ flag, tip, active, onToggle }) {
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)

  function showTooltip() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, left: r.left + r.width / 2 })
    }
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => onToggle(flag)}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setPos(null)}
        aria-pressed={active}
        className={`px-2 py-0.5 rounded font-mono text-xs font-medium transition-colors ${
          active
            ? 'bg-indigo-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        {flag}
      </button>

      {pos && createPortal(
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 9999 }}
          className="px-2 py-1 rounded bg-gray-800 dark:bg-gray-700 text-white text-xs whitespace-nowrap pointer-events-none"
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800 dark:border-b-gray-700" />
          <span className="font-mono text-indigo-300">{flag}</span>
          <span className="text-gray-300">: {tip}</span>
        </div>,
        document.body
      )}
    </>
  )
}

export default function EditorPanel({ pattern, testString, error, matches, flags, onPatternChange, onTestStringChange, onFlagToggle, darkMode, chunks }) {
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
            /{flags}
          </span>
        </div>

        {/* Flag toggles */}
        <div className="flex items-center gap-1.5">
          {FLAG_META.map(({ flag, tip }) => (
            <FlagPill
              key={flag}
              flag={flag}
              tip={tip}
              active={flags.includes(flag)}
              onToggle={onFlagToggle}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 font-mono px-1">{error}</p>
        )}

        {/* Plain-English summary of what the regex matches */}
        <div className="min-h-10 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
          {chunks?.length > 0 ? (
            <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
              {summarizeRegex(chunks)}
            </p>
          ) : (
            <p className="text-xs text-indigo-300 dark:text-indigo-600 italic">
              An English description of your regex will appear here
            </p>
          )}
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
