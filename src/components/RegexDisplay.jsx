// Per type text color exported so BreakdownPanel can reuse the same palette
// on the raw text line of each card
export const TYPE_TEXT = {
  anchor:      'text-violet-600 dark:text-violet-400',
  escape:      'text-orange-600 dark:text-orange-400',
  shorthand:   'text-cyan-600 dark:text-cyan-400',
  charClass:   'text-emerald-600 dark:text-emerald-400',
  literal:     'text-slate-500 dark:text-slate-300',
  alternation: 'text-rose-600 dark:text-rose-400',
  unknown:     'text-amber-600 dark:text-amber-400',
}

// Hover background internal to this component
const TYPE_BG_HOVER = {
  anchor:      'bg-violet-100 dark:bg-violet-400/20',
  escape:      'bg-orange-100 dark:bg-orange-400/20',
  shorthand:   'bg-cyan-100 dark:bg-cyan-400/20',
  charClass:   'bg-emerald-100 dark:bg-emerald-400/20',
  literal:     'bg-slate-100 dark:bg-slate-400/20',
  alternation: 'bg-rose-100 dark:bg-rose-400/20',
  unknown:     'bg-amber-100 dark:bg-amber-400/20',
}

export default function RegexDisplay({ chunks, hoveredChunkId, onChunkHover }) {
  if (!chunks.length) return null

  return (
    <div className="px-4 py-3">
      <p className="font-mono text-sm leading-relaxed break-all">
        {chunks.map(chunk => {
          const isHovered = chunk.id === hoveredChunkId
          const textClass = TYPE_TEXT[chunk.type]     ?? TYPE_TEXT.unknown
          const bgClass   = isHovered
            ? (TYPE_BG_HOVER[chunk.type] ?? TYPE_BG_HOVER.unknown)
            : 'bg-transparent'

          return (
            <span
              key={chunk.id}
              data-chunk-id={chunk.id}
              className={`rounded px-0.5 cursor-pointer transition-colors duration-100 ${textClass} ${bgClass}`}
              onMouseEnter={() => onChunkHover(chunk.id)}
              onMouseLeave={() => onChunkHover(null)}
            >
              {chunk.raw}
            </span>
          )
        })}
      </p>
    </div>
  )
}
