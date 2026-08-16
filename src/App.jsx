import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import PatternBar from './components/PatternBar'
import TestPanel from './components/TestPanel'
import BreakdownPanel from './components/BreakdownPanel'
import { ExamplesRail, ExamplesDrawer } from './components/Examples'
import Footer from './components/Footer'
import { parseRegex, getMatches } from './lib/regexEngine'
import { explainRegex } from './lib/regexExplainer'
import { useMediaQuery } from './lib/useMediaQuery'
import examples from './data/examples.json'

const CANONICAL_FLAG_ORDER = 'gims'
const THEME_KEY = 'ezregex-theme'

const TABS = [
  { value: 'test', label: 'Test string', tabId: 'tab-test', panelId: 'panel-test' },
  { value: 'breakdown', label: 'Breakdown', tabId: 'tab-breakdown', panelId: 'panel-breakdown' },
]

// The inline script in index.html has already resolved the theme before paint;
// read it back rather than guessing a default and causing a second flash.
function initialTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState('g')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState('test')
  const [hoveredChunkId, setHoveredChunkId] = useState(null)
  const [flashedChunkId, setFlashedChunkId] = useState(null)

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const showDrawer = drawerOpen && !isDesktop

  const examplesButtonRef = useRef(null)
  const flashTimer = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Private browsing / storage disabled — the theme still applies for this session
    }
  }, [theme])

  // Return focus to the button that opened the drawer. Runs as an effect rather
  // than inside the close handler because the shell is still `inert` at that
  // point, and inert elements refuse focus.
  const drawerWasOpen = useRef(false)
  useEffect(() => {
    if (drawerWasOpen.current && !showDrawer) examplesButtonRef.current?.focus()
    drawerWasOpen.current = showDrawer
  }, [showDrawer])

  useEffect(() => () => clearTimeout(flashTimer.current), [])

  const { regex, error } = useMemo(() => parseRegex(pattern, flags), [pattern, flags])
  const { matches, truncated } = useMemo(() => getMatches(regex, testString), [regex, testString])
  const { chunks } = useMemo(() => explainRegex(pattern), [pattern])

  function toggleFlag(flag) {
    setFlags(prev => {
      const next = prev.includes(flag) ? prev.replace(flag, '') : prev + flag
      return CANONICAL_FLAG_ORDER.split('')
        .filter(c => next.includes(c))
        .join('')
    })
  }

  function loadExample(example) {
    setPattern(example.pattern)
    setFlags(example.flags)
    setTestString(example.sample)
    setDrawerOpen(false)
    setMobileTab('test')
  }

  function flashChunk(chunkId) {
    clearTimeout(flashTimer.current)
    setFlashedChunkId(chunkId)
    document
      .querySelector(`[data-card-chunk-id="${chunkId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    flashTimer.current = setTimeout(() => setFlashedChunkId(null), 700)
  }

  function onTabKeyDown(e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const i = TABS.findIndex(t => t.value === mobileTab)
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length]
    setMobileTab(next.value)
    document.getElementById(next.tabId)?.focus()
  }

  const panelProps = value => ({
    id: TABS.find(t => t.value === value).panelId,
    role: isDesktop ? 'region' : 'tabpanel',
    labelledBy: isDesktop ? undefined : TABS.find(t => t.value === value).tabId,
  })

  return (
    <>
      <a href="#test-string" className="skip-link">
        Skip to test string
      </a>

      <div
        // While the drawer is open the rest of the app is inert — the native way
        // to trap focus in a modal without hand-rolling a tab loop
        inert={showDrawer || undefined}
        className="flex h-dvh flex-col overflow-hidden bg-canvas font-sans text-ink"
      >
        <Header
          theme={theme}
          onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
          onOpenExamples={() => setDrawerOpen(true)}
          examplesButtonRef={examplesButtonRef}
          examplesOpen={showDrawer}
        />

        <PatternBar
          pattern={pattern}
          flags={flags}
          error={error}
          chunks={chunks}
          onPatternChange={setPattern}
          onFlagToggle={toggleFlag}
        />

        <div className="flex min-h-0 flex-1">
          <ExamplesRail pattern={pattern} flags={flags} onLoad={loadExample} />

          <div className="flex min-w-0 flex-1 flex-col">
            <div
              role="tablist"
              aria-label="Panels"
              className="flex h-11 flex-shrink-0 border-b border-line bg-surface md:hidden"
            >
              {TABS.map(tab => {
                const selected = mobileTab === tab.value
                return (
                  <button
                    key={tab.value}
                    id={tab.tabId}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={tab.panelId}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setMobileTab(tab.value)}
                    onKeyDown={onTabKeyDown}
                    className={`focus-ring-inset relative flex-1 text-[13px] font-medium transition-colors duration-100 ease-out ${
                      selected ? 'text-ink' : 'text-ink-faint'
                    }`}
                  >
                    {tab.label}
                    {tab.value === 'breakdown' && chunks.length > 0 && (
                      <span className="ml-1.5 text-ink-faint tabular-nums">{chunks.length}</span>
                    )}
                    {selected && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent-fill" aria-hidden="true" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex min-h-0 flex-1">
              {/* display:contents keeps these wrappers out of the flex layout —
                  they exist only to switch panels on mobile */}
              <div className={mobileTab === 'test' ? 'contents' : 'hidden md:contents'}>
                <TestPanel
                  {...panelProps('test')}
                  pattern={pattern}
                  testString={testString}
                  error={error}
                  matches={matches}
                  truncated={truncated}
                  onTestStringChange={setTestString}
                />
              </div>

              <div className={mobileTab === 'breakdown' ? 'contents' : 'hidden md:contents'}>
                <BreakdownPanel
                  {...panelProps('breakdown')}
                  chunks={chunks}
                  hoveredChunkId={hoveredChunkId}
                  onChunkHover={setHoveredChunkId}
                  flashedChunkId={flashedChunkId}
                  onChunkClick={flashChunk}
                  onTryExample={() => loadExample(examples[0])}
                />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {showDrawer && (
        <ExamplesDrawer
          pattern={pattern}
          flags={flags}
          onLoad={loadExample}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  )
}
