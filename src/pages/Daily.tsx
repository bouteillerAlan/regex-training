import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { getDailyExercise, getRandomExercise, isTodayDone, getStreak, completeDailyExercise, todayLabel } from '../utils/daily'
import { getMatches, useMatchColors } from '../utils/regex'
import { HighlightInput, MatchResults, PatternInput } from '../regex-ui'
import { useProgress } from '../utils/progress'
import { diffStars } from '../exercises'

function patternsMatch(
  user: { pattern: string; flags: string },
  solution: { pattern: string; flags: string },
  text: string,
): { ok: boolean; msg: string } {
  try {
    const u = getMatches(user.pattern, user.flags, text)
    const s = getMatches(solution.pattern, solution.flags, text)
    if (u.error) return { ok: false, msg: 'Your pattern has an error' }
    if (u.matches.length !== s.matches.length)
      return { ok: false, msg: `Expected ${s.matches.length} match${s.matches.length !== 1 ? 'es' : ''}, got ${u.matches.length}` }
    for (let i = 0; i < s.matches.length; i++) {
      if (u.matches[i].text !== s.matches[i].text)
        return { ok: false, msg: `Match #${i + 1} differs: expected "${s.matches[i].text}", got "${u.matches[i].text}"` }
    }
    return { ok: true, msg: `✅ Perfect! All ${s.matches.length} match${s.matches.length !== 1 ? 'es' : ''} correct.` }
  } catch {
    return { ok: false, msg: 'Error checking solution' }
  }
}

function streakLabel(n: number) {
  if (n >= 30) return `🔥 ${n} day streak — legendary!`
  if (n >= 7)  return `🔥 ${n} day streak — on fire!`
  if (n >= 2)  return `🔥 ${n} day streak`
  return `🔥 1 day streak — great start!`
}

/* ---------- Already-done view ---------- */

function AlreadyDone({ streak, exerciseId, onAnother }: { streak: number; exerciseId: string; onAnother: () => void }) {
  return (
    <div className="daily-page">
      <div className="daily-meta">
        <span className="daily-date-label">📅 {todayLabel()}</span>
      </div>
      <div className="daily-done-card">
        <div className="daily-done-icon">✅</div>
        <h2 className="daily-done-title">You're done for today!</h2>
        <p className="daily-done-sub">Come back tomorrow to keep your streak alive.</p>
        <div className="daily-streak-pill">{streakLabel(streak)}</div>
        <div className="daily-done-actions">
          <button className="action-btn secondary" onClick={onAnother} type="button">
            🎲 Another exercise
          </button>
          <Link to="/exercises/$id" params={{ id: exerciseId }} className="action-btn secondary">
            Review today's
          </Link>
          <Link to="/exercises" className="action-btn primary">
            All exercises
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ---------- Page ---------- */

export default function Daily() {
  const [currentEx, setCurrentEx] = useState(getDailyExercise)
  const [alreadyDone] = useState(isTodayDone)
  const [showingExtra, setShowingExtra] = useState(false)
  const [streak, setStreak] = useState(getStreak)
  const [justCompleted, setJustCompleted] = useState(false)

  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [checkResult, setCheckResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const ex = currentEx

  const loadAnother = () => {
    setCurrentEx(getRandomExercise(currentEx.id))
    setShowingExtra(true)
    setPattern('')
    setFlags('g')
    setShowHint(false)
    setShowSolution(false)
    setCheckResult(null)
  }

  const { markDone } = useProgress()
  const matchColors = useMatchColors()
  const { matches, error } = useMemo(() => getMatches(pattern, flags, ex.text), [pattern, flags, ex.text])

  if (alreadyDone && !justCompleted && !showingExtra) {
    return <AlreadyDone streak={streak} exerciseId={ex.id} onAnother={loadAnother} />
  }

  const handleCheck = () => {
    const result = patternsMatch({ pattern, flags }, { pattern: ex.pattern, flags: ex.flags }, ex.text)
    setCheckResult(result)
    if (result.ok) {
      markDone(ex.id)
      const newStreak = completeDailyExercise()
      setStreak(newStreak)
      setJustCompleted(true)
    }
  }

  const handleShowSolution = () => {
    setShowSolution(true)
    setPattern(ex.pattern)
    setFlags(ex.flags)
    setTimeout(() => {
      const result = patternsMatch(
        { pattern: ex.pattern, flags: ex.flags },
        { pattern: ex.pattern, flags: ex.flags },
        ex.text,
      )
      setCheckResult(result)
    }, 0)
  }

  return (
    <div className="daily-page">
      {/* header */}
      <div className="daily-intro">
        <h2 className="daily-intro-title">Your daily dose of regex training</h2>
        <p className="daily-intro-sub">One exercise a day keeps the pattern blindness away.</p>
      </div>

      <div className="daily-meta">
        <span className="daily-date-label">📅 {todayLabel()}</span>
        {streak > 0 && <span className="daily-streak-pill">{streakLabel(streak)}</span>}
        <button className="daily-reroll-btn" onClick={loadAnother} type="button">🎲 Another</button>
      </div>

      <div className="daily-head">
        <div className="daily-head-left">
          <h2 className="daily-title">Daily Exercise</h2>
          <span className={`diff-badge ${ex.difficulty}`}>{ex.difficulty}</span>
          <span className="exercise-category">{ex.category}</span>
        </div>
        <div className="exercise-diff-stars">{diffStars(ex.difficulty)}</div>
      </div>

      {/* completion celebration */}
      {justCompleted && (
        <div className="daily-completed-banner">
          🎉 Done! {streakLabel(streak)} — see you tomorrow.
          <Link to="/exercises" className="daily-more-link">Want more?</Link>
        </div>
      )}

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

      {/* playground */}
      <div className="playground">
        <PatternInput
          value={pattern}
          onChange={setPattern}
          flags={flags}
          onFlagsChange={setFlags}
          validFlags={['g', 'i', 'm', 's', 'u', 'y']}
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
          <div className="solution-header">Solution</div>
          <div className="solution-pattern">
            <code>/{ex.pattern}/{ex.flags}</code>
          </div>
          <div className="solution-explain">{ex.explain}</div>
        </div>
      )}
    </div>
  )
}
