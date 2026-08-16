import RegexDisplay from './RegexDisplay'
import { styleFor } from '../lib/tokenStyles'
import logo from '../assets/EzRegexLogo.png'

function EmptyState({ onTryExample }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <img src={logo} alt="" width={48} height={48} className="size-12 opacity-40" />
      <p className="max-w-[24ch] text-[13px] leading-relaxed text-ink-faint text-pretty">
        Every part of your pattern gets explained here, one piece at a time.
      </p>
      <button
        type="button"
        onClick={onTryExample}
        className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-accent-fill px-3 py-1.5 text-[13px] font-medium text-accent-on transition-[background-color,transform] duration-100 ease-out hover:bg-accent-hover active:scale-[0.98]"
      >
        Try an example
        <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}

export default function BreakdownPanel({
  id,
  role,
  labelledBy,
  chunks = [],
  hoveredChunkId,
  onChunkHover,
  flashedChunkId,
  onChunkClick,
  onTryExample,
}) {
  const hasChunks = chunks.length > 0

  return (
    <aside
      id={id}
      role={role}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : 'Breakdown'}
      className="flex w-full min-w-0 flex-col bg-sunken md:w-80 md:flex-shrink-0 md:border-l md:border-line lg:w-96"
    >
      {/* Hidden on mobile, where the tab bar already carries the name and count */}
      <div className="hidden h-11 flex-shrink-0 items-center justify-between gap-3 border-b border-line px-3 md:flex md:px-4">
        <h2 className="eyebrow">Breakdown</h2>
        {hasChunks && (
          <span className="text-xs tabular-nums text-ink-faint">
            {chunks.length} {chunks.length === 1 ? 'token' : 'tokens'}
          </span>
        )}
      </div>

      {hasChunks && (
        <div className="flex-shrink-0 border-b border-line bg-surface px-3 py-3 md:px-4">
          <RegexDisplay
            chunks={chunks}
            hoveredChunkId={hoveredChunkId}
            onChunkHover={onChunkHover}
            flashedChunkId={flashedChunkId}
            onChunkClick={onChunkClick}
          />
        </div>
      )}

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        {!hasChunks ? (
          <EmptyState onTryExample={onTryExample} />
        ) : (
          <ul key={chunks.map(c => c.id).join('-')} className="animate-fade-in">
            {chunks.map(chunk => {
              const { text } = styleFor(chunk.type)
              const isFlashing = chunk.id === flashedChunkId
              const isHovered = chunk.id === hoveredChunkId

              return (
                <li key={chunk.id}>
                  <button
                    type="button"
                    data-card-chunk-id={chunk.id}
                    className={`focus-ring-inset block w-full border-b border-l-2 border-b-line px-3 py-3 text-left transition-colors duration-100 ease-out md:px-4 ${
                      isFlashing
                        ? 'border-l-accent bg-accent-soft'
                        : isHovered
                          ? 'border-l-line-strong bg-surface'
                          : 'border-l-transparent'
                    }`}
                    onMouseEnter={() => onChunkHover(chunk.id)}
                    onMouseLeave={() => onChunkHover(null)}
                    onFocus={() => onChunkHover(chunk.id)}
                    onBlur={() => onChunkHover(null)}
                    onClick={() => onChunkClick(chunk.id)}
                  >
                    <span className={`mb-1 block font-mono text-[13px] break-all ${text}`}>
                      {chunk.raw}
                    </span>
                    <span className="block text-[13px] leading-relaxed text-ink-muted text-pretty">
                      {chunk.description}
                    </span>
                    {chunk.useCase && (
                      <span className="mt-1.5 block text-xs leading-relaxed text-ink-faint text-pretty">
                        {chunk.useCase}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
