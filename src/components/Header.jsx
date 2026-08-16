import logo from '../assets/EzRegexLogo.png'

function IconButton({ label, onClick, href, children }) {
  const className =
    'focus-ring inline-flex size-8 items-center justify-center rounded-lg text-ink-muted ' +
    'transition-colors duration-100 ease-out hover:bg-sunken hover:text-ink'

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={className}>
      {children}
    </button>
  )
}

export default function Header({ theme, onToggleTheme, onOpenExamples, examplesButtonRef, examplesOpen }) {
  const isDark = theme === 'dark'

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-3 md:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          ref={examplesButtonRef}
          type="button"
          onClick={onOpenExamples}
          aria-label="Open examples"
          aria-expanded={examplesOpen}
          aria-controls="examples-drawer"
          className="focus-ring -ml-1 inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-100 ease-out hover:bg-sunken hover:text-ink md:hidden"
        >
          <svg className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </button>

        {/* Wordmark. The mark carries ~45% transparent padding of its own, so
            it needs a larger box than its optical size suggests. Decorative —
            the name sits right beside it. */}
        <img
          src={logo}
          alt=""
          width={32}
          height={32}
          className="-ml-1 size-8 flex-shrink-0"
        />
        <span className="text-[15px] font-semibold tracking-tight text-ink">EzRegex</span>

        <span className="hidden h-3.5 w-px flex-shrink-0 bg-line sm:block" aria-hidden="true" />
        <span className="hidden truncate text-[13px] text-ink-faint sm:block">
          Regex, in plain English
        </span>
      </div>

      <div className="flex flex-shrink-0 items-center gap-0.5">
        <IconButton
          label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={onToggleTheme}
        >
          {isDark ? (
            <svg className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path strokeLinecap="round" d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.36 5.64l-1.41 1.41M7.05 16.95l-1.41 1.41M18.36 18.36l-1.41-1.41M7.05 7.05L5.64 5.64" />
            </svg>
          ) : (
            <svg className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.35 15.35A8.5 8.5 0 018.65 3.65a8.5 8.5 0 1011.7 11.7z" />
            </svg>
          )}
        </IconButton>

        <IconButton label="EzRegex on GitHub" href="https://github.com/yuv1s/EzRegex">
          <svg className="size-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </IconButton>
      </div>
    </header>
  )
}
