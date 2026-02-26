'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import BenchCard from '@/components/BenchCard'
import WaitlistModal from '@/components/WaitlistModal'

const WAITLIST_CARDS = [
  { id: 'chill',   emoji: '😄', name: 'Chill Corner',  promise: '"Because sometimes you just have to laugh at this job."',            cls: 'c-chill'   },
  { id: 'paywall', emoji: '💰', name: 'The PayWall',   promise: '"See what salespeople like you actually earn. By city. By role."',    cls: 'c-paywall', chart: true },
  { id: 'tools',   emoji: '🧮', name: 'Tools',         promise: '"Is your offer fair? Is your quota real? Find out fast."',            cls: 'c-tools',   chips: true },
  { id: 'space',   emoji: '🌳', name: 'Your Space',    promise: '"Your wins. Your numbers. Your career asset — not your company\'s."', cls: 'c-space',   pro: true   },
  { id: 'notes',   emoji: '🌱', name: 'Park Notes',    promise: '"Honest writing about the human side of sales. No hustle. No hype."', cls: 'c-notes', stat: 'Weekly' },
]

export default function Home() {
  const [modal, setModal] = useState<string | null>(null)

  return (
    <>
      <Nav />
      <main className="sp-main">
        <div className="hero-strip fade-up">
          <div className="hero-tag">For the person carrying the number</div>
          <h1 className="hero-h">The park where<br /><em>sales breathes freely.</em></h1>
          <p className="hero-sub">No login to browse. No manager watching. Just salespeople being honest.</p>
        </div>

        <div className="grid">
          <BenchCard onClick={() => {}} />

          {WAITLIST_CARDS.map(card => (
            <button
              key={card.id}
              id={card.id}
              className={`card ${card.cls}`}
              onClick={() => setModal(card.name)}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <div className="card-emoji">{card.emoji}</div>
              <div className="card-name">{card.name}</div>
              <div className="card-promise">{card.promise}</div>

              {card.chart && (
                <div className="mini-chart">
                  <div className="bar-wrap">
                    <div className="bar" style={{ height: '23px' }} />
                    <div className="bar-lbl">AE</div>
                  </div>
                  <div className="bar-wrap">
                    <div className="bar" style={{ height: '14px' }} />
                    <div className="bar-lbl">SDR</div>
                  </div>
                  <div className="bar-wrap">
                    <div className="bar" style={{ height: '34px' }} />
                    <div className="bar-lbl">VP</div>
                  </div>
                </div>
              )}

              {card.chips && (
                <div className="chips">
                  <span className="chip">🧮 Comp Calc</span>
                  <span className="chip">🚩 Offer Red Flags</span>
                  <span className="chip">📊 OTE Check</span>
                </div>
              )}

              {card.stat && <div className="card-stat">{card.stat}</div>}
              {card.pro && <div className="card-tag">Park Pro</div>}
              <div className="card-arrow">→</div>
            </button>
          ))}
        </div>

        <div className="proof">
          <div className="proof-item">Growing community</div>
          <div className="proof-item">Multiple countries</div>
          <div className="proof-item">Real stories</div>
          <div className="proof-item">Free to read. No login needed.</div>
        </div>
      </main>

      <footer className="sp-footer">
        <div className="foot-q">&ldquo;Built for the person carrying the number. Not the person watching it.&rdquo;</div>
        <div className="foot-b">TheSalesPark · 2026</div>
      </footer>

      {modal && <WaitlistModal section={modal} onClose={() => setModal(null)} />}
    </>
  )
}