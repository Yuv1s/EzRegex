export default function Footer() {
  return (
    <footer className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
      <span>
        Built by{' '}
        <a
          href="https://github.com/yuv1s"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          yuv1s
        </a>
      </span>

      <span className="flex items-center gap-1">
        Built with{' '}
        <a
          href="https://react.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          React
        </a>
        {' + '}
        <a
          href="https://vitejs.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          Vite
        </a>
      </span>
    </footer>
  )
}
