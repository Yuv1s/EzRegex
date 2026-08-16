import { useRef } from 'react'
import { buildHighlightedHtml, MATCH_LIMIT } from '../lib/regexEngine'

function MatchReadout({ pattern, error, matches, truncated }) {
  if (error) {
    return <span className="text-xs text-ink-faint">Pattern invalid</span>
  }

  if (!pattern) {
    return <span className="text-xs text-ink-faint">No pattern yet</span>
  }

  if (matches.length === 0) {
    return <span className="text-xs text-ink-faint">No matches</span>
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-muted">
      <span className="size-1.5 rounded-full bg-accent-fill" aria-hidden="true" />
      <span className="font-medium tabular-nums text-ink">
        {truncated ? `${MATCH_LIMIT.toLocaleString()}+` : matches.length.toLocaleString()}
      </span>
      {matches.length === 1 && !truncated ? 'match' : 'matches'}
      {truncated && <span className="text-ink-faint">· capped</span>}
    </span>
  )
}

export default function TestPanel({
  id,
  role,
  labelledBy,
  pattern,
  testString,
  error,
  matches,
  truncated,
  onTestStringChange,
}) {
  const backdropRef = useRef(null)

  function syncScroll(e) {
    const backdrop = backdropRef.current
    if (!backdrop) return
    backdrop.scrollTop = e.currentTarget.scrollTop
    backdrop.scrollLeft = e.currentTarget.scrollLeft
  }

  return (
    <section
      id={id}
      role={role}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : 'Test string'}
      className="flex min-w-0 flex-1 flex-col bg-canvas"
    >
      <div className="flex h-11 flex-shrink-0 items-center justify-end gap-3 border-b border-line px-3 md:justify-between md:px-5">
        {/* On mobile the tab above already says "Test string" — keep the label
            for the textarea's accessible name, but out of sight */}
        <label htmlFor="test-string" className="eyebrow sr-only md:not-sr-only">
          Test string
        </label>
        <span aria-live="polite" aria-atomic="true">
          <MatchReadout pattern={pattern} error={error} matches={matches} truncated={truncated} />
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        {/* Highlight layer. Sits under the textarea and must wrap identically —
            both carry .hl-layer, which owns every metric that affects wrapping. */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="hl-layer pointer-events-none absolute inset-0 overflow-hidden text-ink"
          dangerouslySetInnerHTML={{ __html: buildHighlightedHtml(testString, matches) }}
        />

        <textarea
          id="test-string"
          value={testString}
          onChange={e => onTestStringChange(e.target.value)}
          onScroll={syncScroll}
          placeholder="Paste or type the text you want to match against…"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="hl-layer scroll-thin focus-ring-inset absolute inset-0 size-full resize-none overflow-auto bg-transparent text-transparent caret-ink outline-none placeholder:text-ink-faint"
        />
      </div>
    </section>
  )
}
