import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import EditorPanel from './components/EditorPanel'
import ResultsPanel from './components/ResultsPanel'

export default function App() {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 font-sans">
      <Header darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <Sidebar />
        <EditorPanel />
        <ResultsPanel />
      </div>
    </div>
  )
}
