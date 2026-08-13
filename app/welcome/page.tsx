'use client'
import Link from 'next/link'

export default function Welcome() {
  return (
    <main className="min-h-screen bg-[#FBF8F4] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-8">

        <div className="w-24 h-24 rounded-full bg-[#EDE8F5] flex items-center justify-center text-5xl shadow-sm">
          💜
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-[#2B3A4A] tracking-tight">Together</h1>
          <p className="text-[#2B3A4A]/50 text-sm font-medium leading-relaxed">
            A private space for just the two of you.<br />
            No algorithms. No strangers. Just love.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Link
            href="/create"
            className="w-full h-14 rounded-2xl bg-[#C4B5E0] text-white font-bold text-base shadow-sm flex items-center justify-center active:scale-[0.98] transition-transform"
          >
            Start your space
          </Link>
          <Link
            href="/join"
            className="w-full h-14 rounded-2xl bg-white border border-[#EDE8F5] text-[#2B3A4A] font-bold text-base shadow-sm flex items-center justify-center active:scale-[0.98] transition-transform"
          >
            Join with a code
          </Link>
          <Link
            href="/signin"
            className="w-full h-14 rounded-2xl text-[#9B88C8] font-bold text-base flex items-center justify-center active:scale-[0.98] transition-transform"
          >
            Sign back in
          </Link>
        </div>

        <p className="text-[11px] text-[#2B3A4A]/30 font-medium">
          No ads. Just you two.
        </p>
      </div>
    </main>
  )
}
