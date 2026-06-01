import { useState, useMemo } from 'react'
import { examples, cheatSheet, type Flavor, type Example } from '../data'
import { getMatches, useMatchColors } from '../utils/regex'
import { HighlightInput, MatchResults, FlagsRow } from '../regex-ui'

const FLAVORS: { value: Flavor; label: string; icon: string }[] = [
  { value: 'javascript', label: 'JavaScript', icon: 'JS' },
  { value: 'pcre', label: 'PCRE / Neovim', icon: 'NV' },
  { value: 'python', label: 'Python', icon: 'PY' },
]

const FLAVOR_FLAGS: Record<Flavor, string[]> = {
  javascript: ['g', 'i', 'm', 's', 'u', 'y'],
  pcre: ['g', 'i', 'm', 's', 'u', 'x'],
  python: ['g', 'i', 'm', 's', 'u', 'x'],
}

export default function Playground() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testText, setTestText] = useState('')
  const [flavor, setFlavor] = useState<Flavor>('javascript')
  const [showExamples, setShowExamples] = useState(false)
  const [showCheat, setShowCheat] = useState(false)
  const [selectedExample, setSelectedExample] = useState<Example | null>(null)

  const matchColors = useMatchColors()
  const { matches, error } = useMemo(() => getMatches(pattern, flags, testText), [pattern, flags, testText])

  const loadExample = (ex: Example) => {
    setSelectedExample(ex)
    setPattern(ex.pattern)
    setFlags(ex.flags)
    setTestText(ex.text)
    setShowExamples(false)
  }

  const validFlags = FLAVOR_FLAGS[flavor]

  return (
    <>
      {/* toolbar */}
      <div className="toolbar">
        <div className="flavor-group">
          {FLAVORS.map(f => (
            <button
              key={f.value}
              className={`flavor-btn${flavor === f.value ? ' active' : ''}`}
              onClick={() => { setFlavor(f.value); setSelectedExample(null) }}
              type="button"
            >
              <span className="flavor-icon">{f.icon}</span>
              <span className="flavor-label">{f.label}</span>
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <button className="toolbar-btn" onClick={() => { setShowExamples(!showExamples); setShowCheat(false) }} type="button">
            📚 Examples
          </button>
          <button className="toolbar-btn" onClick={() => { setShowCheat(!showCheat); setShowExamples(false) }} type="button">
            📖 Cheat Sheet
          </button>
        </div>
      </div>

      {/* playground */}
      <div className="playground">
        <div className="panel panel-pattern">
          <div className="panel-header">
            <label className="panel-title">Pattern</label>
            {selectedExample && <span className="example-badge">{selectedExample.name}</span>}
          </div>
          <div className="pattern-input-wrap">
            <span className="pattern-delim">/</span>
            <input
              className="pattern-input"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              spellCheck={false}
              autoComplete="off"
            />
            <span className="pattern-delim">/</span>
            <span className="pattern-flags-display">{flags}</span>
          </div>
          {error && <div className="error-msg">⚠ {error}</div>}
          {!error && pattern && matches.length === 0 && <div className="info-msg">No matches</div>}
          <FlagsRow flags={flags} onChange={setFlags} valid={validFlags} />
          <span className="flags-hint">
            {flavor === 'javascript' ? '(g)lobal (i)gnoreCase (m)ultiline (s)ingleLine (u)nicode (y)sticky' :
             '(g)lobal (i)gnoreCase (m)ultiline (s)ingleLine (u)nicode (x)extended'}
          </span>
        </div>

        <div className="panel panel-text">
          <div className="panel-header">
            <label className="panel-title">Test Text</label>
            <span className="stats">
              {testText.length > 0 && <>{testText.length} chars · {matches.length} match{matches.length !== 1 ? 'es' : ''}</>}
            </span>
          </div>
          <HighlightInput
            value={testText}
            onChange={setTestText}
            placeholder="Type or paste text to test against here…"
            matches={matches}
            matchColors={matchColors}
          />
        </div>
      </div>

      {/* matches */}
      <MatchResults matches={matches} />

      {/* examples panel */}
      {showExamples && (
        <section className="drawer">
          <div className="drawer-header">
            <h2>📚 Examples — {FLAVORS.find(f => f.value === flavor)?.label}</h2>
            <button className="drawer-close" onClick={() => setShowExamples(false)} type="button">✕</button>
          </div>
          <div className="examples-grid">
            {examples[flavor].map((ex, i) => (
              <button key={i} className="example-card" onClick={() => loadExample(ex)} type="button">
                <div className="example-name">{ex.name}</div>
                <div className="example-pattern">/{ex.pattern}/{ex.flags}</div>
                <div className="example-desc">{ex.desc}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* cheat sheet */}
      {showCheat && (
        <section className="drawer">
          <div className="drawer-header">
            <h2>📖 Quick Reference — {FLAVORS.find(f => f.value === flavor)?.label}</h2>
            <button className="drawer-close" onClick={() => setShowCheat(false)} type="button">✕</button>
          </div>
          <div className="cheat-grid">
            {cheatSheet[flavor].map((item, i) => (
              <div key={i} className="cheat-card">
                <code className="cheat-syntax">{item.syntax}</code>
                <span className="cheat-desc">{item.desc}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* footer */}
      <footer className="footer">
        <span>type a pattern · see matches live · learn by doing</span>
        <span className="footer-flavor">
          {flavor === 'javascript' ? 'Uses native JS RegExp' :
           flavor === 'pcre' ? 'Uses JS RegExp (PCRE features documented for reference)' :
           'Uses JS RegExp (Python features documented for reference)'}
        </span>
      </footer>
    </>
  )
}
