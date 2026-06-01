import { useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { exercises, diffStars } from '../exercises'
import { chapters } from '../chapters'
import { useProgress } from '../utils/progress'

/* ---------- guide renderer ---------- */

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>
    }
    return part
  })
}

function GuideRenderer({ content }: { content: string }) {
  const lines = content.split('\n')
  const out: ReactNode[] = []
  let codeBuf: string[] = []
  let inCode = false

  const flushCode = () => {
    if (codeBuf.length > 0) {
      out.push(<pre key={out.length}><code>{codeBuf.join('\n')}</code></pre>)
      codeBuf = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (inCode) { flushCode(); inCode = false }
      else { flushCode(); inCode = true }
      continue
    }

    if (inCode) { codeBuf.push(line); continue }

    if (line.trim() === '') { out.push(<div key={out.length} className="guide-spacer" />); continue }

    if (line.startsWith('> ')) {
      out.push(<blockquote key={out.length}>{renderInline(line.slice(2))}</blockquote>)
      continue
    }

    if (line.startsWith('- ')) {
      out.push(<li key={out.length}>{renderInline(line.slice(2))}</li>)
      continue
    }

    if (line.startsWith('| ') && line.endsWith('|')) {
      const cells = line.split('|').filter(Boolean).map(s => s.trim())
      out.push(
        <div key={out.length} className="guide-table-row">
          {cells.map((c, ci) => (
            <span key={ci} className="guide-table-cell">{renderInline(c)}</span>
          ))}
        </div>,
      )
      continue
    }

    out.push(<p key={out.length}>{renderInline(line)}</p>)
  }

  if (inCode) flushCode()

  return <div className="guide-content">{out}</div>
}

/* ---------- page ---------- */

export default function ExercisesList() {
  const { isDone } = useProgress()
  const [openGuide, setOpenGuide] = useState<string | null>(null)

  const allDone = chapters.every(ch => ch.exercises.every(id => isDone(id)))
  const totalDone = exercises.filter(e => isDone(e.id)).length

  return (
    <div className="exercises-page">
      {/* intro */}
      <div className="exercises-intro">
        <h2 className="exercises-title">🏋️ Master Regex, Step by Step</h2>
        <p className="exercises-subtitle">
          <strong>{exercises.length} hands-on exercises</strong> - from your first literal match to real-world patterns like email, URL, and password validation.
          Each exercise guides you through writing the right pattern, with live feedback, hints, and a full explanation when you're stuck.
        </p>
        <p className="exercises-subtitle" style={{ marginTop: 8 }}>
          Start with <strong>Getting Started</strong> below, then work your way through each chapter.
          Use the <strong>Playground</strong> to experiment freely whenever you want to test your own patterns.
          Your progress is saved automatically in this browser (local storage).
        </p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(totalDone / exercises.length) * 100}%` }} />
        </div>
        <p className="exercises-progress-text">
          {totalDone} / {exercises.length} completed{totalDone === exercises.length ? ' - 🎉 You did it!' : ''}
        </p>
      </div>

      {/* chapters */}
      <div className="chapters-list">
        {chapters.map(ch => {
          const chExs = ch.exercises.map(id => exercises.find(e => e.id === id)!).filter(Boolean)
          const chDone = chExs.filter(e => isDone(e.id)).length
          const isOpen = openGuide === ch.id

          return (
            <div key={ch.id} className="chapter-block">
              <div className="chapter-head">
                <div className="chapter-head-left">
                  <h3 className="chapter-title">{ch.title}</h3>
                  <span className="chapter-progress">{chDone}/{chExs.length} done</span>
                </div>
                <button
                  className="chapter-guide-btn"
                  onClick={() => setOpenGuide(isOpen ? null : ch.id)}
                  type="button"
                >
                  📖 {isOpen ? 'Hide Guide' : 'Guide'}
                </button>
              </div>
              <p className="chapter-desc">{ch.desc}</p>

              {isOpen && (
                <div className="chapter-guide">
                  <GuideRenderer content={ch.guide} />
                </div>
              )}

              {/* exercises in this chapter */}
              <div className="chapter-exercises">
                {chExs.map(ex => {
                  const done = isDone(ex.id)
                  return (
                    <Link
                      key={ex.id}
                      to="/exercises/$id"
                      params={{ id: ex.id }}
                      className={`chapter-ex-card${done ? ' done' : ''}`}
                    >
                      <span className="ch-ex-num">#{ex.id}</span>
                      <span className="ch-ex-title">{ex.title}</span>
                      <span className="ch-ex-diff">{diffStars(ex.difficulty)}</span>
                      {done && <span className="ch-ex-check">✓</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="all-done-banner">
          🎉 All exercises completed! You've mastered regex fundamentals.
        </div>
      )}
    </div>
  )
}
