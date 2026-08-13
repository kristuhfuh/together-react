'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { DECKS, DeckKey } from '@/lib/data/prompts'
import Link from 'next/link'
import { Suspense } from 'react'

function DecksContent() {
  const searchParams = useSearchParams()
  const deckKey = (searchParams.get('deck') ?? 'deep') as DeckKey
  const deck = DECKS[deckKey] ?? DECKS.deep
  const keys = Object.keys(DECKS) as DeckKey[]

  const [idx, setIdx] = useState(0)
  const total = deck.prompts.length

  useEffect(() => { setIdx(0) }, [deckKey])

  function prev() { setIdx(i => (i - 1 + total) % total) }
  function next() { setIdx(i => (i + 1) % total) }

  return (
    <main className="px-5 pt-12 pb-6 max-w-sm mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/home" className="text-[#9B88C8] text-sm font-bold">← Home</Link>
        <h1 className="text-xl font-extrabold text-[#2B3A4A]">Fun Games</h1>
      </div>

      {/* Deck selector */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {keys.map(k => (
          <Link
            key={k}
            href={`/decks?deck=${k}`}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              k === deckKey
                ? 'bg-[#C4B5E0] text-white shadow-sm'
                : 'bg-white text-[#2B3A4A]/60 border border-[#EDE8F5]'
            }`}
          >
            {DECKS[k].icon} {DECKS[k].name}
          </Link>
        ))}
      </div>

      {/* Card */}
      <div
        className="rounded-3xl p-8 flex flex-col items-center justify-center min-h-56 text-center shadow-sm"
        style={{ background: deck.bg }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-4">
          {idx + 1} / {total}
        </p>
        <p className="text-xl font-bold text-[#2B3A4A] leading-snug">{deck.prompts[idx]}</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          className="w-14 h-14 rounded-full bg-white border border-[#EDE8F5] shadow-sm flex items-center justify-center text-xl text-[#2B3A4A]/60 active:scale-95 transition-transform"
        >
          ←
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {deck.prompts.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${
                i === idx ? 'w-4 h-2 bg-[#9B88C8]' : 'w-2 h-2 bg-[#9B88C8]/30'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-14 h-14 rounded-full bg-[#C4B5E0] shadow-sm flex items-center justify-center text-xl text-white active:scale-95 transition-transform"
        >
          →
        </button>
      </div>
    </main>
  )
}

export default function Decks() {
  return (
    <Suspense>
      <DecksContent />
    </Suspense>
  )
}
