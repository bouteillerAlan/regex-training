export default function About() {
  return (
    <div className="about-page">
      <div className="about-card">
        <h2 className="about-title">About Regex Playground</h2>
        <p className="about-text">
          Regex Playground is a free, open-source tool for learning and practising regular expressions directly in your browser.
          No sign-up, no setup — just you and your patterns.
        </p>
        <p className="about-text">
          It covers everything from your first literal match to advanced concepts like lookaheads, named groups, and lazy quantifiers,
          through 40 hands-on exercises organised into chapters with guides and live feedback.
          A daily exercise keeps your skills sharp one pattern at a time.
        </p>

        <hr className="about-divider" />

        <h3 className="about-section-title">Features</h3>
        <ul className="about-list">
          <li>40 exercises from beginner to expert, grouped into 7 chapters</li>
          <li>Live match highlighting as you type</li>
          <li>Daily exercise with streak tracking</li>
          <li>Free-form playground with JS, PCRE, and Python cheat sheets</li>
          <li>Progress saved locally in your browser</li>
        </ul>

        <hr className="about-divider" />

        <h3 className="about-section-title">Made by</h3>
        <p className="about-text">
          Built by{' '}
          <a className="about-link" href="https://rmv.a2n.dev/" target="_blank" rel="noopener noreferrer">
            Alan Bouteiller
          </a>
          . Powered by React, TypeScript, and Vite.
        </p>
      </div>
    </div>
  )
}
