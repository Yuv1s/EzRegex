import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { summarizeRegex } from '../lib/regexExplainer'

const FLAG_META = [
  { flag: 'g', tip: 'global — find every match, not just the first' },
  { flag: 'i', tip: 'case insensitive' },
  { flag: 'm', tip: 'multiline — ^ and $ match at line breaks' },
  { flag: 's', tip: 'dotAll — . also matches newlines' },
]

function FlagPill({ flag, tip, active, onToggle }) {
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)

  function show() {
    const r = btnRef.current?.getBoundingClientRect()
    if (r) setPos({ top: r.bottom + 8, left: r.left + r.width / 2 })
  }

  // The pill lives in a scrollable band, so a fixed-position tooltip drifts off
  // its anchor the moment anything scrolls. Dismiss instead of re-measuring.
  useEffect(() => {
    if (!pos) return
    const hide = () => setPos(null)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [pos])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => onToggle(flag)}
        onMouseEnter={show}
        onMouseLeave={() => setPos(null)}
        onFocus={show}
        onBlur={() => setPos(null)}
        aria-pressed={active}
        aria-label={`${flag} flag — ${tip}`}
        className={`focus-ring size-7 rounded-md border font-mono text-[13px] leading-none transition-colors duration-100 ease-out ${
          active
            ? 'border-accent-line bg-accent-soft text-accent'
            : 'border-line bg-surface text-ink-faint hover:border-line-strong hover:text-ink-muted'
        }`}
      >
        {flag}
      </button>

      {pos &&
        createPortal(
          <div
            style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 60 }}
            className="pointer-events-none -translate-x-1/2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap text-ink-muted shadow-lg"
            aria-hidden="true"
          >
            <span className="font-mono text-accent">{flag}</span>
            <span className="text-ink-faint"> · </span>
            {tip}
          </div>,
          document.body,
        )}
    </>
  )
}

function CopyButton({ pattern, flags }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(`/${pattern}/${flags}`)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1400)
    } catch {
      // Clipboard blocked (insecure context, denied permission) — the pattern is
      // still selectable in the field, so fail quietly rather than alarm anyone.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!pattern}
      className="focus-ring inline-flex h-7 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-ink-muted transition-colors duration-100 ease-out hover:border-line-strong hover:text-ink disabled:pointer-events-none disabled:opacity-40"
    >
      {copied ? (
        <svg className="size-3.5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.5l5 5 10-11" />
        </svg>
      ) : (
        <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2.5" />
          <path strokeLinecap="round" d="M15 5.5A2.5 2.5 0 0012.5 3h-7A2.5 2.5 0 003 5.5v7A2.5 2.5 0 005.5 15" />
        </svg>
      )}
      {copied ? 'Copied' : 'Copy'}
      <span className="sr-only"> pattern with flags</span>
    </button>
  )
}

export default function PatternBar({ pattern, flags, error, chunks, onPatternChange, onFlagToggle }) {
  const hasSummary = !error && chunks.length > 0

  return (
    <section
      aria-label="Pattern"
      className="flex-shrink-0 border-b border-line bg-surface px-3 py-3.5 md:px-5 md:py-4"
    >
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <label htmlFor="regex-input" className="eyebrow mr-auto">
          Pattern
        </label>

        <div className="flex items-center gap-1" role="group" aria-label="Regex flags">
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

        <span className="h-4 w-px bg-line" aria-hidden="true" />

        <CopyButton pattern={pattern} flags={flags} />
      </div>

      {/* Outer tray / inner plate — the field reads as a machined part rather
          than a box drawn on the page */}
      <div
        className={`rounded-xl border p-1 transition-colors duration-100 ease-out ${
          error ? 'border-danger-soft bg-danger-soft' : 'border-line bg-sunken'
        }`}
      >
        <div
          className={`flex items-stretch overflow-hidden rounded-lg border bg-surface transition-colors duration-100 ease-out ${
            error ? 'border-danger' : 'border-line focus-within:border-accent-line'
          }`}
        >
          <span className="flex select-none items-center pl-3.5 font-mono text-[15px] text-ink-faint" aria-hidden="true">
            /
          </span>

          <input
            id="regex-input"
            type="text"
            value={pattern}
            onChange={e => onPatternChange(e.target.value)}
            placeholder="\d{3}-\d{4}"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-describedby="pattern-readout"
            aria-invalid={!!error}
            className="min-w-0 flex-1 bg-transparent px-2 py-3 font-mono text-[15px] text-ink outline-none placeholder:text-ink-faint/60"
          />

          {pattern && (
            <button
              type="button"
              onClick={() => onPatternChange('')}
              aria-label="Clear pattern"
              className="focus-ring-inset flex items-center px-1.5 text-ink-faint transition-colors duration-100 ease-out hover:text-ink"
            >
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
              </svg>
            </button>
          )}

          <span
            className="flex select-none items-center border-l border-line pr-3.5 pl-3 font-mono text-[15px] text-ink-faint"
            aria-label={`Active flags: ${flags || 'none'}`}
          >
            /{flags}
          </span>
        </div>
      </div>

      {/* One slot, three states — error, summary, or the prompt to start */}
      <div id="pattern-readout" aria-live="polite" className="mt-2 min-h-[1.5rem]">
        {error ? (
          <p role="alert" className="flex items-start gap-2 font-mono text-xs leading-relaxed text-danger">
            <svg className="mt-px size-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 7.5v5.5M12 16.2v.3" />
            </svg>
            {error}
          </p>
        ) : hasSummary ? (
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted text-pretty">
            <span className="mt-px font-mono text-accent" aria-hidden="true">
              ↳
            </span>
            {summarizeRegex(chunks)}
          </p>
        ) : (
          <p className="text-[13px] leading-relaxed text-ink-faint">
            Type a pattern above and it will be explained here, in English.
          </p>
        )}
      </div>
    </section>
  )
}
