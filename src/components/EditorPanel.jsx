export default function EditorPanel() {
  return (
    <main className="flex-1 flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 overflow-y-auto">
      {/* Regex input */}
      <section className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Regular Expression
        </label>
        <div className="flex items-center gap-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-colors">
          <span className="px-3 py-2.5 text-gray-400 dark:text-gray-500 font-mono text-sm bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 select-none">
            /
          </span>
          <input
            type="text"
            placeholder="Enter your regex here…"
            className="flex-1 px-3 py-2.5 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 outline-none"
            readOnly
          />
          <span className="px-3 py-2.5 text-gray-400 dark:text-gray-500 font-mono text-sm bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 select-none">
            /g
          </span>
        </div>

        {/* Plain-English breakdown placeholder */}
        <div className="min-h-10 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-400 dark:text-indigo-500 font-mono">
          Plain-English breakdown will appear here — <span className="opacity-60">TODO</span>
        </div>
      </section>

      {/* Test string */}
      <section className="flex flex-col gap-2 flex-1">
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Test String
        </label>
        <textarea
          placeholder="Paste your test string here…"
          className="flex-1 min-h-48 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 font-mono text-sm resize-none outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
          readOnly
        />
      </section>
    </main>
  )
}
