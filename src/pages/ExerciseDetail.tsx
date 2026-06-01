import { useState, useMemo, useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { exercises, diffStars, type Exercise } from '../exercises'
import { chapters } from '../chapters'
import { getMatches, useMatchColors } from '../utils/regex'
import { HighlightInput, MatchResults, PatternInput } from '../regex-ui'
import { useProgress } from '../utils/progress'

/* ---------- solution check ---------- */

function patternsMatch(users: { pattern: string; flags: string }, solution: { pattern: string; flags: string }, text: string): { ok: boolean; msg: string } {
  try {
    const u = getMatches(users.pattern, users.flags, text)
    const s = getMatches(solution.pattern, solution.flags, text)
    if (u.error) return { ok: false, msg: 'Your pattern has an error' }
    if (u.matches.length !== s.matches.length) return { ok: false, msg: `Expected ${s.matches.length} match${s.matches.length !== 1 ? 'es' : ''}, got ${u.matches.length}` }
    for (let i = 0; i < s.matches.length; i++) {
      if (u.matches[i].text !== s.matches[i].text) return { ok: false, msg: `Match #${i + 1} differs: expected "${s.matches[i].text}", got "${u.matches[i].text}"` }
    }
    return { ok: true, msg: `✅ Perfect! All ${s.matches.length} match${s.matches.length !== 1 ? 'es' : ''} correct.` }
  } catch {
    return { ok: false, msg: 'Error checking solution' }
  }
}

/* ---------- page ---------- */

export default function ExerciseDetail() {
  const { id } = useParams({ from: '/exercises/$id' })
  const ex = exercises.find(e => e.id === id) as Exercise | undefined
  const { isDone, toggle, markDone } = useProgress()

  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [checkResult, setCheckResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    setPattern('')
    setFlags('g')
    setShowHint(false)
    setShowSolution(false)
    setCheckResult(null)
  }, [id])

  const matchColors = useMatchColors()
  const { matches, error } = useMemo(() => getMatches(pattern, flags, ex?.text ?? ''), [pattern, flags, ex?.text])

  const ch = ex ? chapters.find(c => c.id === ex.chapter) : null

  if (!ex) {
    return (
      <div className="exercise-not-found">
        <p>Exercise not found.</p>
        <Link to="/exercises">← Back to exercises</Link>
      </div>
    )
  }

  const handleCheck = () => {
    const result = patternsMatch({ pattern, flags }, { pattern: ex.pattern, flags: ex.flags }, ex.text)
    setCheckResult(result)
    if (result.ok) {
      markDone(ex.id)
      setShowSolution(true)
    }
  }

  const handleShowSolution = () => {
    setShowSolution(true)
    setPattern(ex.pattern)
    setFlags(ex.flags)
    setTimeout(() => {
      setCheckResult(patternsMatch({ pattern: ex.pattern, flags: ex.flags }, { pattern: ex.pattern, flags: ex.flags }, ex.text))
    }, 0)
  }

  const done = isDone(ex.id)
  const validFlags = ['g', 'i', 'm', 's', 'u', 'y']

  return (
    <div className="exercise-page">
      <Link to="/exercises" className="back-link">← Back to exercises</Link>

      {/* header */}
      <div className="exercise-head">
        <div className="exercise-head-left">
          <h2 className="exercise-head-title">#{ex.id} {ex.title}</h2>
          <span className={`diff-badge ${ex.difficulty}`}>{ex.difficulty}</span>
          <span className="exercise-category">{ex.category}</span>
        </div>
        <div className="exercise-diff-stars">{diffStars(ex.difficulty)}</div>
      </div>

      {/* chapter context */}
      {ch && <div className="chapter-context">Chapter: {ch.title}</div>}

      {/* description */}
      <div className="exercise-desc-box">
        <p dangerouslySetInnerHTML={{ __html: ex.desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      </div>

      {/* hint */}
      {showHint && (
        <div className="exercise-hint">
          <strong>💡 Hint:</strong> {ex.hint}
        </div>
      )}

      {/* playground mini */}
      <div className="playground">
        <PatternInput
          value={pattern}
          onChange={setPattern}
          flags={flags}
          onFlagsChange={setFlags}
          validFlags={validFlags}
          error={error}
        />

        <div className="panel panel-text">
          <div className="panel-header">
            <label className="panel-title">Test Text</label>
            <span className="stats">
              {ex.text.length} chars · {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </span>
          </div>
          <HighlightInput
            value={ex.text}
            onChange={() => {}}
            placeholder=""
            matches={matches}
            matchColors={matchColors}
            disabled
          />
        </div>
      </div>

      <MatchResults matches={matches} />

      {/* actions */}
      <div className="exercise-actions">
        <button className="action-btn secondary" onClick={() => setShowHint(!showHint)} type="button">
          💡 {showHint ? 'Hide' : 'Show'} Hint
        </button>
        <button className="action-btn secondary" onClick={handleShowSolution} type="button">
          👁 Show Solution
        </button>
        <button className="action-btn primary" onClick={handleCheck} type="button">
          ✓ Check
        </button>
        <button
          className={`action-btn ${done ? 'done' : 'secondary'}`}
          onClick={() => toggle(ex.id)}
          type="button"
        >
          {done ? '✅ Done!' : '☐ Mark Done'}
        </button>
      </div>

      {/* check result */}
      {checkResult && (
        <div className={`check-result ${checkResult.ok ? 'ok' : 'fail'}`}>
          {checkResult.msg}
        </div>
      )}

      {/* solution */}
      {showSolution && (
        <div className="solution-box">
          <div className="solution-header">
            {checkResult?.ok ? 'Reference solution (may differ from yours)' : 'Solution'}
          </div>
          <div className="solution-pattern">
            <code>/{ex.pattern}/{ex.flags}</code>
          </div>
          <div className="solution-explain">
            {ex.explain}
          </div>
        </div>
      )}

      {/* prev / next */}
      <div className="exercise-nav">
        {(() => {
          const idx = exercises.indexOf(ex)
          const prev = idx > 0 ? exercises[idx - 1] : null
          const next = idx < exercises.length - 1 ? exercises[idx + 1] : null
          return (
            <>
              {prev ? (
                <Link to="/exercises/$id" params={{ id: prev.id }} className="nav-link-ex">
                  ← #{prev.id} {prev.title}
                </Link>
              ) : <span />}
              {next ? (
                <Link to="/exercises/$id" params={{ id: next.id }} className="nav-link-ex">
                  #{next.id} {next.title} →
                </Link>
              ) : <span />}
            </>
          )
        })()}
      </div>
    </div>
  )
}
