const linkClass =
  'focus-ring rounded text-ink-muted underline-offset-4 transition-colors duration-100 ease-out hover:text-ink hover:underline'

export default function Footer() {
  return (
    <footer
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className="flex h-9 flex-shrink-0 items-center justify-between gap-4 border-t border-line bg-surface px-3 text-xs text-ink-faint md:px-5"
    >
      <span>
        Built by{' '}
        <a href="https://github.com/yuv1s" target="_blank" rel="noopener noreferrer" className={linkClass}>
          yuv1s
        </a>
      </span>

      <span className="hidden sm:block">
        Everything runs in your browser — nothing is sent anywhere
      </span>

      <span>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className={linkClass}>
          React
        </a>
        <span className="px-1.5 text-line-strong" aria-hidden="true">
          ·
        </span>
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" className={linkClass}>
          Vite
        </a>
      </span>
    </footer>
  )
}
