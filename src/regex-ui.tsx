import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import type { Match } from './utils/regex'
import { getMatches } from './utils/regex'
import { EditorView, Decoration, type DecorationSet, placeholder as cmPlaceholder } from '@codemirror/view'
import { EditorState, StateEffect, StateField, RangeSetBuilder } from '@codemirror/state'

/* ---------- CodeMirror highlight extension ---------- */

const setHighlights = StateEffect.define<{ matches: Match[]; colors: string[] }>()

const highlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes)
    for (const e of tr.effects) {
      if (e.is(setHighlights)) {
        const builder = new RangeSetBuilder<Decoration>()
        const sorted = [...e.value.matches].sort((a, b) => a.index - b.index)
        for (let i = 0; i < sorted.length; i++) {
          const m = sorted[i]
          builder.add(
            m.index, m.index + m.length,
            Decoration.mark({ attributes: { style: `background:${e.value.colors[i % e.value.colors.length]};border-radius:2px;` } }),
          )
        }
        deco = builder.finish()
      }
    }
    return deco
  },
  provide: f => EditorView.decorations.from(f),
})

const cmTheme = EditorView.theme({
  '&': { flex: '1', minHeight: '0' },
  '.cm-scroller': {
    padding: '12px',
    overflow: 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.92rem',
    lineHeight: '1.6',
  },
  '.cm-content': {
    padding: '0',
    caretColor: 'var(--text)',
    color: 'var(--text)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-line': { padding: '0' },
  '.cm-placeholder': { color: 'var(--text-dim)', opacity: '0.5' },
})

/* ---------- HighlightInput ---------- */

export function HighlightInput({ value, onChange, placeholder, matches, matchColors, disabled }: {
  value: string; onChange: (v: string) => void; placeholder: string
  matches: Match[]; matchColors: string[]; disabled?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          highlightField,
          EditorView.lineWrapping,
          EditorView.editable.of(!disabled),
          EditorState.readOnly.of(!!disabled),
          cmPlaceholder(placeholder),
          cmTheme,
          EditorView.updateListener.of(update => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString())
          }),
        ],
      }),
      parent: containerRef.current,
    })
    viewRef.current = view

    const observer = new ResizeObserver(() => view.requestMeasure())
    observer.observe(containerRef.current!)
    return () => { observer.disconnect(); view.destroy(); viewRef.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } })
    }
  }, [value])

  useEffect(() => {
    viewRef.current?.dispatch({ effects: setHighlights.of({ matches, colors: matchColors }) })
  }, [matches, matchColors])

  return <div ref={containerRef} className="highlight-input-wrap" />
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
