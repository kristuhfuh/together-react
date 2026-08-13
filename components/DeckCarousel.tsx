'use client'
import Link from 'next/link'
import { DECKS, DeckKey } from '@/lib/data/prompts'

export function DeckCarousel() {
  const keys = Object.keys(DECKS) as DeckKey[]

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 mb-3">Fun Games</p>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {keys.map((key) => {
          const deck = DECKS[key]
          return (
            <Link
              key={key}
              href={`/decks?deck=${key}`}
              className="flex-shrink-0 w-28 h-32 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
              style={{ background: deck.bg }}
            >
              <span className="text-3xl">{deck.icon}</span>
              <span className="text-xs font-bold text-[#2B3A4A]">{deck.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
