import RegexDisplay, { TYPE_TEXT } from './RegexDisplay'

const CARD_FLASH_BG = 'bg-indigo-100 dark:bg-indigo-800/40'
const CARD_HOVER_BG = 'bg-indigo-50 dark:bg-indigo-950/40'

export default function ResultsPanel({ chunks = [], hoveredChunkId, onChunkHover, flashedChunkId, onChunkClick }) {
  const hasChunks = chunks.length > 0
  const chunksKey = chunks.map(c => c.id).join('-')

  return (
    <aside
      className="w-full md:w-72 md:flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-col"
      aria-label="Regex breakdown"
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Breakdown
        </h2>
      </div>

      {hasChunks && (
        <div className="border-b border-gray-200 dark:border-gray-800">
          <RegexDisplay
            chunks={chunks}
            hoveredChunkId={hoveredChunkId}
            onChunkHover={onChunkHover}
            flashedChunkId={flashedChunkId}
            onChunkClick={onChunkClick}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-indigo">
        {!hasChunks ? (
          <div className="flex items-center justify-center h-full p-6">
            <p className="text-sm text-gray-400 dark:text-gray-600 text-center leading-relaxed">
              Type a regex above to see an English breakdown
            </p>
          </div>
        ) : (
          <div
            key={chunksKey}
            className="divide-y divide-gray-200 dark:divide-gray-800 result-fadein"
          >
            {chunks.map(chunk => {
              const isFlashing = chunk.id === flashedChunkId
              const isHovered  = chunk.id === hoveredChunkId
              const cardBg     = isFlashing ? CARD_FLASH_BG : isHovered ? CARD_HOVER_BG : ''
              const rawColor   = TYPE_TEXT[chunk.type] ?? TYPE_TEXT.unknown

              return (
                <div
                  key={chunk.id}
                  data-card-chunk-id={chunk.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${chunk.raw}: ${chunk.description}`}
                  className={`px-4 py-3 cursor-default transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${cardBg}`}
                  onMouseEnter={() => onChunkHover(chunk.id)}
                  onMouseLeave={() => onChunkHover(null)}
                  onClick={() => onChunkClick(chunk.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onChunkClick(chunk.id)
                    }
                  }}
                >
                  <p className={`font-mono text-xs mb-1 ${rawColor}`}>{chunk.raw}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {chunk.description}
                  </p>
                  {chunk.useCase && (
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 italic leading-relaxed">
                      {chunk.useCase}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
