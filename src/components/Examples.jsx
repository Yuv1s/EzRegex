import { useEffect, useMemo, useRef, useState } from 'react'
import examples from '../data/examples.json'

const CATEGORIES = ['Validation', 'Extraction', 'Cleanup', 'Code']

function ExampleCard({ example, isActive, onLoad, cardRef }) {
  return (
    <li>
      <button
        ref={cardRef}
        type="button"
        onClick={() => onLoad(example)}
        aria-current={isActive ? 'true' : undefined}
        className={`focus-ring-inset block w-full border-b border-l-2 border-b-line px-3 py-2.5 text-left transition-colors duration-100 ease-out ${
          isActive
            ? 'border-l-accent bg-accent-soft'
            : 'border-l-transparent hover:border-l-line-strong hover:bg-surface'
        }`}
      >
        <span
          className={`mb-0.5 block truncate text-[13px] font-medium ${
            isActive ? 'text-accent' : 'text-ink'
          }`}
        >
          {example.label}
        </span>
        <span className="mb-1 block truncate font-mono text-[11px] text-ink-muted">
          /{example.pattern}/{example.flags}
        </span>
        <span className="block truncate text-[11px] text-ink-faint">{example.description}</span>
      </button>
    </li>
  )
}

function ExamplesList({ pattern, flags, onLoad }) {
  const [query, setQuery] = useState('')
  const cardRefs = useRef({})

  const activeId = useMemo(
    () => examples.find(e => e.pattern === pattern && e.flags === flags)?.id ?? null,
    [pattern, flags],
  )

  useEffect(() => {
    if (activeId) cardRefs.current[activeId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return examples.filter(
      e =>
        e.label.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.pattern.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
    )
  }, [query])

  function card(example) {
    return (
      <ExampleCard
        key={example.id}
        example={example}
        isActive={example.id === activeId}
        onLoad={onLoad}
        cardRef={el => {
          cardRefs.current[example.id] = el
        }}
      />
    )
  }

  return (
    <>
      <div className="flex-shrink-0 border-b border-line p-2">
        <div className="relative flex items-center">
          <svg
            className="pointer-events-none absolute left-2.5 size-3.5 text-ink-faint"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path strokeLinecap="round" d="M20.5 20.5l-4.2-4.2" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search examples"
            spellCheck={false}
            aria-label="Search examples"
            className="focus-ring w-full rounded-lg border border-line bg-surface py-1.5 pr-7 pl-8 text-[13px] text-ink outline-none transition-colors duration-100 ease-out placeholder:text-ink-faint hover:border-line-strong focus:border-accent-line [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="focus-ring absolute right-1.5 flex size-5 items-center justify-center rounded text-ink-faint transition-colors duration-100 ease-out hover:text-ink"
            >
              <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        {filtered ? (
          filtered.length > 0 ? (
            <ul>{filtered.map(card)}</ul>
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-[13px] text-ink-muted">No examples match</p>
              <p className="mt-1 truncate font-mono text-[13px] text-ink-faint">{query}</p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="focus-ring mt-4 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-muted transition-colors duration-100 ease-out hover:border-line-strong hover:text-ink"
              >
                Clear search
              </button>
            </div>
          )
        ) : (
          CATEGORIES.map(category => {
            const items = examples.filter(e => e.category === category)
            if (!items.length) return null
            return (
              <section key={category} aria-label={category}>
                <h3 className="eyebrow sticky top-0 z-10 border-b border-line bg-sunken px-3 py-2">
                  {category}
                </h3>
                <ul>{items.map(card)}</ul>
              </section>
            )
          })
        )}
      </div>
    </>
  )
}

/** Persistent left rail — desktop only. Hidden below md, so it drops out of the
 *  tab order there without needing `inert`. */
export function ExamplesRail(props) {
  return (
    <aside
      aria-label="Examples"
      className="hidden w-64 flex-shrink-0 flex-col border-r border-line bg-sunken md:flex lg:w-72"
    >
      <div className="flex h-11 flex-shrink-0 items-center border-b border-line px-3">
        <h2 className="eyebrow">Examples</h2>
      </div>
      <ExamplesList {...props} />
    </aside>
  )
}

/** Mobile drawer. Only mounted while open — the app shell behind it is marked
 *  `inert` by App, which is what actually traps focus. */
export function ExamplesDrawer({ onClose, ...props }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    dialogRef.current?.focus()
    const onKeyDown = e => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <>
      <div
        className="animate-fade-in fixed inset-0 z-30 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id="examples-drawer"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Examples"
        tabIndex={-1}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        className="animate-drawer fixed inset-y-0 left-0 z-40 flex w-[86%] max-w-xs flex-col border-r border-line bg-sunken outline-none"
      >
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-line px-3">
          <h2 className="eyebrow">Examples</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close examples"
            className="focus-ring inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-100 ease-out hover:bg-surface hover:text-ink"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
            </svg>
          </button>
        </div>
        <ExamplesList {...props} />
      </div>
    </>
  )
}
