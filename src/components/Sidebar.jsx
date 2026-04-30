import { useState, useMemo, useEffect, useRef } from 'react'
import examples from '../data/examples.json'

const CATEGORIES = ['Validation', 'Extraction', 'Cleanup', 'Code']

const CATEGORY_BADGE = {
  Validation: 'text-emerald-500 dark:text-emerald-400',
  Extraction: 'text-sky-500 dark:text-sky-400',
  Cleanup:    'text-amber-500 dark:text-amber-400',
  Code:       'text-violet-500 dark:text-violet-400',
}

function ExampleCard({ example, onLoadExample, showCategory = false, isActive = false, cardRef }) {
  return (
    <button
      ref={cardRef}
      onClick={() => onLoadExample(example)}
      className={`w-full text-left px-4 py-3 border-b border-l-2 transition-colors group ${
        isActive
          ? 'border-l-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 border-b-indigo-100 dark:border-b-indigo-900/40'
          : 'border-l-transparent border-b-gray-100 dark:border-b-gray-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2 mb-0.5">
        <span className={`text-sm font-medium truncate ${
          isActive
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
        }`}>
          {example.label}
        </span>
        {showCategory && (
          <span className={`text-xs font-semibold flex-shrink-0 ${CATEGORY_BADGE[example.category] ?? 'text-gray-400'}`}>
            {example.category}
          </span>
        )}
      </div>
      <code className={`block font-mono text-xs truncate mb-1 ${
        isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-indigo-500 dark:text-indigo-400'
      }`}>
        /{example.pattern}/{example.flags}
      </code>
      <p className="text-xs text-gray-400 dark:text-gray-500 leading-snug">
        {example.description}
      </p>
    </button>
  )
}

export default function Sidebar({ onLoadExample, pattern, flags }) {
  const [query, setQuery] = useState('')
  const cardRefs = useRef({})

  const activeId = useMemo(
    () => examples.find(e => e.pattern === pattern && e.flags === flags)?.id ?? null,
    [pattern, flags]
  )

  useEffect(() => {
    if (activeId) {
      cardRefs.current[activeId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return examples.filter(e =>
      e.label.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.pattern.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    )
  }, [query])

  function renderCard(example) {
    return (
      <ExampleCard
        key={example.id}
        example={example}
        onLoadExample={onLoadExample}
        isActive={example.id === activeId}
        showCategory={!!filtered}
        cardRef={el => { cardRefs.current[example.id] = el }}
      />
    )
  }

  return (
    <aside className="w-full max-h-60 md:max-h-none md:w-64 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Examples
        </h2>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="relative flex items-center">
          <svg
            className="absolute left-2 w-3.5 h-3.5 text-gray-400 dark:text-gray-600 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search examples…"
            spellCheck={false}
            className="w-full pl-7 pr-6 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-indigo">
        {filtered ? (
          filtered.length > 0 ? (
            filtered.map(renderCard)
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-600">No results for</p>
              <p className="mt-0.5 font-mono text-sm text-gray-500 dark:text-gray-500 truncate px-2">"{query}"</p>
            </div>
          )
        ) : (
          CATEGORIES.map(cat => {
            const items = examples.filter(e => e.category === cat)
            if (!items.length) return null
            return (
              <div key={cat}>
                <div className="px-4 py-1.5 sticky top-0 z-10 bg-gray-100 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${CATEGORY_BADGE[cat] ?? 'text-gray-400 dark:text-gray-500'}`}>
                    {cat}
                  </span>
                </div>
                {items.map(renderCard)}
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
