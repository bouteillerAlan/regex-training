import { useState } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { useProgress } from '../utils/progress'
import { resetDaily } from '../utils/daily'

export default function Layout() {
  const { reset } = useProgress()
  const [confirming, setConfirming] = useState(false)

  const handleReset = () => {
    reset()
    resetDaily()
    window.location.reload()
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <h1 className="logo">⋈ Regex Playground</h1>
          </Link>
        </div>
        <nav className="nav">
          <Link to="/daily" activeProps={{ className: 'nav-link active' }} className="nav-link">
            📅 Daily
          </Link>
          <Link to="/exercises" activeProps={{ className: 'nav-link active' }} className="nav-link">
            🏋️ Exercises
          </Link>
          <Link to="/playground" activeProps={{ className: 'nav-link active' }} className="nav-link">
            🎯 Playground
          </Link>
          <Link to="/about" activeProps={{ className: 'nav-link active' }} className="nav-link">
            About
          </Link>
          <div className="nav-reset">
            {confirming ? (
              <>
                <span className="nav-reset-label">Reset all progress?</span>
                <button className="nav-reset-btn confirm" onClick={handleReset} type="button">Yes</button>
                <button className="nav-reset-btn cancel" onClick={() => setConfirming(false)} type="button">No</button>
              </>
            ) : (
              <button className="nav-reset-btn" onClick={() => setConfirming(true)} type="button" title="Reset progress">
                ↺
              </button>
            )}
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
