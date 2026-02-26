'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Seed stories — replaced by real Supabase data once drops exist
const SEED_DROPS = [
  { text: "Missed quota by 3%. Lost 40% of my variable. My manager said 'close isn't good enough'. I didn't sleep that night.", meta: "AE · SaaS · 5 years" },
  { text: "My biggest deal closed on a Friday at 11pm. I was alone in my car. Nobody called to say well done.", meta: "Enterprise Sales · 8 years" },
  { text: "They changed my territory two weeks before quarter end. No explanation. Just a new spreadsheet in my inbox.", meta: "Regional Sales · 6 years" },
  { text: "The job post said uncapped commission. The real quota was set so high that nobody had hit it in two years.", meta: "SDR → AE · 4 years" },
  { text: "I cried in the bathroom before a big presentation. Then walked out and closed the deal. Nobody knew.", meta: "Sales Manager · 10 years" },
  { text: "My manager takes credit for every deal I bring to him. My skip-level has no idea what I actually do.", meta: "Account Manager · 3 years" },
]

export default function BenchCard({ onClick }: { onClick: () => void }) {
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(1)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setLeft(l => (l + 2) % SEED_DROPS.length)
        setRight(r => (r + 2) % SEED_DROPS.length)
        setFading(false)
      }, 600)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link href="/bench" className="card card-featured accent-top c-bench" style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div>
          <div className="card-emoji">🌿</div>
          <div className="card-name">The Bench</div>
          <div className="card-promise">&ldquo;Real stories from real salespeople. No names. No judgment.&rdquo;</div>
        </div>
        <div className="card-tag" style={{ flexShrink: 0, marginTop: '0.2rem' }}>Read the stories →</div>
      </div>
      <div className="bench-preview">
        <div className={`bench-sub${fading ? ' fading' : ''}`}>
          <div className="bench-sub-text">&ldquo;{SEED_DROPS[left].text}&rdquo;</div>
          <div className="bench-sub-meta">{SEED_DROPS[left].meta}</div>
        </div>
        <div className={`bench-sub${fading ? ' fading' : ''}`}>
          <div className="bench-sub-text">&ldquo;{SEED_DROPS[right].text}&rdquo;</div>
          <div className="bench-sub-meta">{SEED_DROPS[right].meta}</div>
        </div>
      </div>
      <div className="card-arrow">→</div>
    </Link>
  )
}
