'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mode, setModeState] = useState('day')
  const [accent, setAccentState] = useState('orange')

  useEffect(() => {
    setModeState(document.documentElement.getAttribute('data-mode') || 'day')
    setAccentState(document.documentElement.getAttribute('data-accent') || 'orange')
  }, [])

  function setMode(m: string) {
    setModeState(m)
    localStorage.setItem('sp-mode', m)
    document.documentElement.setAttribute('data-mode', m)
  }

  function setAccent(a: string) {
    setAccentState(a)
    localStorage.setItem('sp-accent', a)
    document.documentElement.setAttribute('data-accent', a)
  }

  function closeMenu() {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }

  function toggleMenu() {
    const next = !menuOpen
    setMenuOpen(next)
    document.body.style.overflow = next ? 'hidden' : ''
  }

  return (
    <>
      <nav className="sp-nav">
        <div className="nav-inner">
          <Link href="/" className="logo">
            <span className="logo-the">the</span>
            <span className="logo-word">sales<span className="logo-accent">park</span></span>
          </Link>

          <ul className="nav-links">
            <li><Link href="/bench">Bench</Link></li>
            <li><a href="/#paywall">PayWall</a></li>
            <li><a href="/#notes">Park Notes</a></li>
            <li><a href="/#tools">Tools</a></li>
            <li><a href="/#space">Your Space</a></li>
          </ul>

          <div className="nav-controls">
            <div className="mode-toggle">
              <button className={`mode-btn${mode === 'day' ? ' active' : ''}`} onClick={() => setMode('day')}>☀ Day</button>
              <div className="mode-divider" />
              <button className={`mode-btn${mode === 'night' ? ' active' : ''}`} onClick={() => setMode('night')}>☾ Night</button>
            </div>
            <div className="accent-swatches">
              {['orange','green','blue'].map(c => (
                <div
                  key={c}
                  className={`swatch swatch-${c}${accent === c ? ' active' : ''}`}
                  onClick={() => setAccent(c)}
                  title={c}
                />
              ))}
            </div>
            <div className="nav-cta">
              <Link href="/bench" className="btn btn-orange">Enter the Bench →</Link>
            </div>
            <button
              className={`burger${menuOpen ? ' open' : ''}`}
              onClick={toggleMenu}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link href="/bench" onClick={closeMenu}><span>🌿</span> The Bench</Link>
        <a href="/#chill" onClick={closeMenu}><span>😄</span> Chill Corner</a>
        <a href="/#paywall" onClick={closeMenu}><span>💰</span> PayWall</a>
        <a href="/#tools" onClick={closeMenu}><span>🧮</span> Tools</a>
        <a href="/#space" onClick={closeMenu}><span>🌳</span> Your Space</a>
        <a href="/#notes" onClick={closeMenu}><span>🌱</span> Park Notes</a>
        <div className="mobile-controls">
          <div className="mode-toggle">
            <button className={`mode-btn${mode === 'day' ? ' active' : ''}`} onClick={() => setMode('day')}>☀ Day</button>
            <div className="mode-divider" />
            <button className={`mode-btn${mode === 'night' ? ' active' : ''}`} onClick={() => setMode('night')}>☾ Night</button>
          </div>
          <div className="accent-swatches">
            {['orange','green','blue'].map(c => (
              <div key={c} className={`swatch swatch-${c}${accent === c ? ' active' : ''}`} onClick={() => setAccent(c)} />
            ))}
          </div>
        </div>
        <div className="mobile-cta">
          <Link href="/bench" className="btn btn-orange" onClick={closeMenu}>Enter the Bench →</Link>
        </div>
      </div>
    </>
  )
}
