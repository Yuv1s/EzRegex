import examples from '../data/examples.json'

const CATEGORIES = ['Validation', 'Extraction', 'Cleanup']

export default function Sidebar({ onLoadExample }) {
  return (
    <aside className="w-full max-h-60 md:max-h-none md:w-64 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Examples
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-indigo">
        {CATEGORIES.map(cat => {
          const items = examples.filter(e => e.category === cat)
          return (
            <div key={cat}>
              <div className="px-4 py-1.5 sticky top-0 z-10 bg-gray-100 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {cat}
                </span>
              </div>
              {items.map(example => (
                <button
                  key={example.id}
                  onClick={() => onLoadExample(example)}
                  className="w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors group"
                >
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate mb-0.5">
                    {example.label}
                  </div>
                  <code className="block font-mono text-xs text-indigo-500 dark:text-indigo-400 truncate mb-1">
                    /{example.pattern}/{example.flags}
                  </code>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-snug">
                    {example.description}
                  </p>
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
