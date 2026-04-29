export default function ResultsPanel() {
  return (
    <aside className="w-full md:w-72 md:flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Results
        </h2>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-gray-400 dark:text-gray-600 text-center leading-relaxed">
          Results will appear here —{' '}
          <span className="text-indigo-400 dark:text-indigo-500 font-mono text-xs">TODO</span>
        </p>
      </div>
    </aside>
  )
}
