import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('photos')
    .select('id, slot, storage_path, caption, taken_at')
    .eq('couple_id', session.coupleId)
    .order('taken_at', { ascending: false })

  const photos = (data ?? []).map(p => ({
    ...p,
    url: supabaseAdmin.storage.from('photos').getPublicUrl(p.storage_path).data.publicUrl,
  }))

  return NextResponse.json(photos)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const caption = (formData.get('caption') as string) ?? ''

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${session.coupleId}/${Date.now()}-${session.slot}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadErr } = await supabaseAdmin.storage
    .from('photos')
    .upload(path, bytes, { contentType: file.type })

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { error: dbErr } = await supabaseAdmin.from('photos').insert({
    couple_id: session.coupleId,
    slot: session.slot,
    storage_path: path,
    caption: caption.trim(),
    taken_at: new Date().toISOString(),
  })

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, storagePath } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  if (storagePath) {
    await supabaseAdmin.storage.from('photos').remove([storagePath])
  }

  await supabaseAdmin
    .from('photos')
    .delete()
    .eq('id', id)
    .eq('couple_id', session.coupleId)

  return NextResponse.json({ ok: true })
}
