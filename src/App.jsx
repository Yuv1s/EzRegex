import { useState, useEffect, useMemo, useRef } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import EditorPanel from './components/EditorPanel'
import ResultsPanel from './components/ResultsPanel'
import Footer from './components/Footer'
import { parseRegex, getMatches } from './lib/regexEngine'
import { explainRegex } from './lib/regexExplainer'

const CANONICAL_FLAG_ORDER = 'gims'

export default function App() {
  const [darkMode, setDarkMode] = useState(true)
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState('g')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState('editor')

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [darkMode])

  function toggleFlag(f) {
    setFlags(prev => {
      const next = prev.includes(f) ? prev.replace(f, '') : prev + f
      return CANONICAL_FLAG_ORDER.split('').filter(c => next.includes(c)).join('')
    })
  }

  function loadExample({ pattern, flags, sample }) {
    setPattern(pattern)
    setFlags(flags)
    setTestString(sample)
    setSidebarOpen(false)
  }

  const { regex, error } = useMemo(() => parseRegex(pattern, flags), [pattern, flags])
  const matches          = useMemo(() => getMatches(regex, testString), [regex, testString])
  const { chunks }       = useMemo(() => explainRegex(pattern), [pattern])

  const [hoveredChunkId, setHoveredChunkId] = useState(null)
  const [flashedChunkId, setFlashedChunkId] = useState(null)
  const flashTimer = useRef(null)

  function handleChunkClick(chunkId) {
    if (flashTimer.current) clearTimeout(flashTimer.current)
    setFlashedChunkId(chunkId)
    const card = document.querySelector(`[data-card-chunk-id="${chunkId}"]`)
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    flashTimer.current = setTimeout(() => setFlashedChunkId(null), 700)
  }

  const tabBtn = (tab, label) => (
    <button
      key={tab}
      role="tab"
      aria-selected={mobileTab === tab}
      onClick={() => setMobileTab(tab)}
      className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
        mobileTab === tab
          ? 'border-indigo-500 text-indigo-500 bg-white dark:bg-gray-900'
          : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 bg-white dark:bg-gray-950'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 font-sans">
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
      />

      {/* Mobile tab bar — hidden on md+ */}
      <div
        className="md:hidden flex-shrink-0 flex border-b border-gray-200 dark:border-gray-800"
        role="tablist"
        aria-label="Panel selector"
      >
        {tabBtn('editor', 'Editor')}
        {tabBtn('breakdown', chunks.length > 0 ? `Breakdown · ${chunks.length}` : 'Breakdown')}
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <Sidebar
          onLoadExample={loadExample}
          pattern={pattern}
          flags={flags}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* display:contents makes these wrappers invisible to flex layout */}
        <div className={mobileTab === 'editor' ? 'contents' : 'hidden md:contents'}>
          <EditorPanel
            pattern={pattern}
            testString={testString}
            error={error}
            matches={matches}
            flags={flags}
            onPatternChange={setPattern}
            onTestStringChange={setTestString}
            onFlagToggle={toggleFlag}
            darkMode={darkMode}
            chunks={chunks}
          />
        </div>

        <div className={mobileTab === 'breakdown' ? 'contents' : 'hidden md:contents'}>
          <ResultsPanel
            chunks={chunks}
            hoveredChunkId={hoveredChunkId}
            onChunkHover={setHoveredChunkId}
            flashedChunkId={flashedChunkId}
            onChunkClick={handleChunkClick}
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}
