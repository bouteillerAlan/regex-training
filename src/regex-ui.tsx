import { useState, useMemo, useRef, type ChangeEvent } from 'react'
import type { Match } from './utils/regex'
import { getMatches } from './utils/regex'

/* ---------- HighlightInput ---------- */

export function HighlightInput({ value, onChange, placeholder, matches, matchColors, disabled }: {
  value: string; onChange: (v: string) => void; placeholder: string
  matches: Match[]; matchColors: string[]; disabled?: boolean
}) {
  const bgRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const segments = useMemo(() => {
    if (!value || matches.length === 0) return null
    const segs: { text: string; isMatch: boolean; idx: number }[] = []
    let last = 0
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i]
      if (m.index > last) segs.push({ text: value.slice(last, m.index), isMatch: false, idx: -1 })
      segs.push({ text: value.slice(m.index, m.index + m.length), isMatch: true, idx: i })
      last = m.index + m.length
    }
    if (last < value.length) segs.push({ text: value.slice(last), isMatch: false, idx: -1 })
    return segs
  }, [value, matches])

  const syncScroll = () => {
    if (bgRef.current && taRef.current) {
      bgRef.current.scrollTop = taRef.current.scrollTop
      bgRef.current.scrollLeft = taRef.current.scrollLeft
    }
  }

  return (
    <div className="highlight-input-wrap">
      <div className="highlight-input-bg" ref={bgRef} aria-hidden>
        {segments
          ? segments.map((s, i) =>
              s.isMatch ? (
                <mark key={i} style={{ background: matchColors[s.idx % matchColors.length] }}>{s.text}</mark>
              ) : (
                <span key={i}>{s.text}</span>
              )
            )
          : <span className="placeholder">{placeholder}</span>}
      </div>
      <textarea
        ref={taRef}
        className="highlight-input-ta"
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          if (!disabled) onChange(e.target.value)
        }}
        onScroll={syncScroll}
        placeholder={placeholder}
        spellCheck={false}
        readOnly={disabled}
      />
    </div>
  )
}

/* ---------- FlagBtn ---------- */

export function FlagBtn({ label, active, onClick, disabled }: { label: string; active: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      className={`flag-btn${active ? ' active' : ''}`}
      onClick={onClick}
      type="button"
      disabled={disabled}
      style={disabled ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}
    >
      {label}
    </button>
  )
}

/* ---------- MatchRow ---------- */

export function MatchRow({ m, idx }: { m: Match; idx: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="match-row">
      <div className="match-row-header" onClick={() => setOpen(!open)}>
        <span className="match-num">#{idx + 1}</span>
        <span className="match-text-preview">"{m.text}"</span>
        <span className="match-pos">{m.index}–{m.index + m.length}</span>
        <span className="match-len">len={m.length}</span>
        <span className="match-toggle">{open ? '▾' : '▸'}</span>
      </div>
      {open && (
        <div className="match-detail">
          <div className="match-detail-groups">
            {m.groups.map((g, gi) => (
              <div key={gi} className="group-row">
                <span className="group-label">{gi === 0 ? 'Full' : `\\${gi}`}</span>
                <span className="group-val">"{g}"</span>
                {gi > 0 && g !== undefined && m.groups[0].includes(g) && (
                  <span className="group-pos">at {m.index + m.groups[0].indexOf(g)}</span>
                )}
              </div>
            ))}
          </div>
          {Object.keys(m.named).length > 0 && (
            <div className="match-detail-named">
              <div className="named-title">Named groups</div>
              {Object.entries(m.named).map(([k, v]) => (
                <div key={k} className="group-row">
                  <span className="group-label">?&lt;{k}&gt;</span>
                  <span className="group-val">"{v}"</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- FlagsRow ---------- */

export function FlagsRow({ flags, onChange, valid }: { flags: string; onChange: (f: string) => void; valid: string[] }) {
  const ALL = ['g', 'i', 'm', 's', 'u', 'y', 'x'] as const
  return (
    <div className="flags-row">
      {ALL.map(f => (
        <FlagBtn
          key={f}
          label={f}
          active={flags.includes(f)}
          disabled={!valid.includes(f)}
          onClick={() => {
            onChange(flags.includes(f) ? flags.replace(f, '') : [...flags, f].sort().join(''))
          }}
        />
      ))}
    </div>
  )
}

/* ---------- PatternInput ---------- */

export function PatternInput({ value, onChange, flags, onFlagsChange, validFlags, error }: {
  value: string; onChange: (v: string) => void
  flags: string; onFlagsChange: (f: string) => void
  validFlags: string[]; error: string | null
}) {
  return (
    <div className="panel panel-pattern">
      <div className="panel-header">
        <label className="panel-title">Pattern</label>
      </div>
      <div className="pattern-input-wrap">
        <span className="pattern-delim">/</span>
        <input
          className="pattern-input"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder="Enter regex pattern..."
          spellCheck={false}
          autoComplete="off"
        />
        <span className="pattern-delim">/</span>
        <span className="pattern-flags-display">{flags}</span>
      </div>
      {error && <div className="error-msg">⚠ {error}</div>}
      {!error && value && !getMatches(value, flags, '').matches.length && (
        <div className="info-msg">No matches</div>
      )}
      <FlagsRow flags={flags} onChange={onFlagsChange} valid={validFlags} />
    </div>
  )
}

/* ---------- MatchResults ---------- */

export function MatchResults({ matches }: { matches: Match[] }) {
  if (matches.length === 0) return null
  return (
    <section className="matches-section">
      <div className="matches-header">
        <h2>Matches <span className="matches-count">({matches.length})</span></h2>
      </div>
      <div className="matches-list">
        {matches.map((m, i) => (
          <MatchRow key={i} m={m} idx={i} />
        ))}
      </div>
    </section>
  )
}
