import { styleFor } from '../lib/tokenStyles'

export default function RegexDisplay({ chunks, hoveredChunkId, onChunkHover, flashedChunkId, onChunkClick }) {
  if (!chunks.length) return null

  return (
    <p className="font-mono text-sm leading-[1.9] break-all">
      {chunks.map(chunk => {
        const { text, soft } = styleFor(chunk.type)
        const isFlashing = chunk.id === flashedChunkId
        const isHovered = chunk.id === hoveredChunkId

        return (
          <button
            key={chunk.id}
            type="button"
            // `inline` keeps the chunks flowing as one line of text; a default
            // inline-block button would break the pattern into a row of boxes.
            // No horizontal padding either — gaps between chunks would read as
            // literal spaces in the pattern, which is a lie about what it matches.
            className={`focus-ring-inset inline rounded-[3px] break-all transition-colors duration-100 ease-out ${text} ${
              isFlashing ? 'bg-accent-soft' : isHovered ? soft : 'bg-transparent'
            }`}
            aria-label={`${chunk.raw}: ${chunk.description}`}
            onMouseEnter={() => onChunkHover(chunk.id)}
            onMouseLeave={() => onChunkHover(null)}
            onFocus={() => onChunkHover(chunk.id)}
            onBlur={() => onChunkHover(null)}
            onClick={() => onChunkClick(chunk.id)}
          >
            {chunk.raw}
          </button>
        )
      })}
    </p>
  )
}
