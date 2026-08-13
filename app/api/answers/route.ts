import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase/server'
import { today } from '@/lib/utils'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const date = new URL(req.url).searchParams.get('date') ?? today()

  const { data } = await supabaseAdmin
    .from('daily_answers')
    .select('slot, answer')
    .eq('couple_id', session.coupleId)
    .eq('date', date)

  const result: Record<string, string> = {}
  for (const row of data ?? []) result[row.slot] = row.answer
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { answer } = await req.json()
  if (!answer?.trim()) return NextResponse.json({ error: 'Empty answer' }, { status: 400 })

  const date = today()

  const { error } = await supabaseAdmin
    .from('daily_answers')
    .upsert(
      { couple_id: session.coupleId, slot: session.slot, date, answer: answer.trim() },
      { onConflict: 'couple_id,slot,date' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
