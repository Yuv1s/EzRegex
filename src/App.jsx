import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import EditorPanel from './components/EditorPanel'
import ResultsPanel from './components/ResultsPanel'
import { parseRegex, getMatches } from './lib/regexEngine'
import { explainRegex } from './lib/regexExplainer'

const CANONICAL_FLAG_ORDER = 'gims'

export default function App() {
  const [darkMode, setDarkMode] = useState(true)
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState('g')

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
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
  }

  const { regex, error } = useMemo(() => parseRegex(pattern, flags), [pattern, flags])
  const matches          = useMemo(() => getMatches(regex, testString), [regex, testString])
  const { chunks }       = useMemo(() => explainRegex(pattern), [pattern])

  const [hoveredChunkId, setHoveredChunkId] = useState(null)

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 font-sans">
      <Header darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <Sidebar onLoadExample={loadExample} pattern={pattern} flags={flags} />
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
        />
        <ResultsPanel
          chunks={chunks}
          hoveredChunkId={hoveredChunkId}
          onChunkHover={setHoveredChunkId}
        />
      </div>
    </div>
  )
}
