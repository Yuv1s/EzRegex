export default function Sidebar() {
  return (
    <aside className="w-full md:w-64 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Examples
        </h2>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-gray-400 dark:text-gray-600 text-center leading-relaxed">
          Examples panel —{' '}
          <span className="text-indigo-400 dark:text-indigo-500 font-mono text-xs">TODO</span>
        </p>
      </div>
    </aside>
  )
}
