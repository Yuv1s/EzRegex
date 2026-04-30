import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import EditorPanel from './components/EditorPanel'
import ResultsPanel from './components/ResultsPanel'
import { parseRegex, getMatches } from './lib/regexEngine'

export default function App() {
  const [darkMode, setDarkMode] = useState(true)
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  const { regex, error } = useMemo(() => parseRegex(pattern), [pattern])
  const matches = useMemo(() => getMatches(regex, testString), [regex, testString])

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 font-sans">
      <Header darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <Sidebar />
        <EditorPanel
          pattern={pattern}
          testString={testString}
          error={error}
          matches={matches}
          onPatternChange={setPattern}
          onTestStringChange={setTestString}
          darkMode={darkMode}
        />
        <ResultsPanel matches={matches} />
      </div>
    </div>
  )
}
