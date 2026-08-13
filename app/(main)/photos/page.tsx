'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from '@/lib/store'
import { useToast } from '@/lib/store'
import { useRealtime } from '@/hooks/useRealtime'

interface Photo {
  id: string
  slot: string
  url: string
  caption: string
  taken_at: string
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function compressImage(file: File, maxPx = 1400, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Compress failed')), 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = url
  })
}

export default function Photos() {
  const myName = useSession(s => s.myName)
  const partnerName = useSession(s => s.partnerName)
  const coupleId = useSession(s => s.coupleId)
  const slot = useSession(s => s.slot)
  const show = useToast(s => s.show)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<Photo | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')

  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  async function loadPhotos() {
    const res = await fetch('/api/photos')
    if (res.ok) setPhotos(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadPhotos() }, [])

  useRealtime(coupleId, (table) => {
    if (table === 'photos') loadPhotos()
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPendingFile(file)
    setCaption('')
  }

  async function handleUpload() {
    if (!pendingFile || uploading) return
    setUploading(true)
    try {
      const blob = await compressImage(pendingFile)
      const formData = new FormData()
      formData.append('file', blob, 'photo.jpg')
      if (caption.trim()) formData.append('caption', caption.trim())
      const res = await fetch('/api/photos', { method: 'POST', body: formData })
      if (res.ok) {
        show('Moment shared 💜')
        loadPhotos()
        setPendingFile(null)
        setCaption('')
      } else {
        show('Upload failed — try again')
      }
    } catch {
      show('Could not upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(photo: Photo) {
    const res = await fetch('/api/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: photo.id }),
    })
    if (res.ok) {
      setPhotos(p => p.filter(x => x.id !== photo.id))
      setSelected(null)
    } else {
      show('Could not delete')
    }
  }

  return (
    <main className="pb-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8]">Moments</p>
          <h1 className="text-2xl font-extrabold text-[#2B3A4A]">Photos</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => cameraRef.current?.click()}
            disabled={uploading}
            className="w-11 h-11 rounded-full bg-[#EDE8F5] text-[#9B88C8] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            title="Take photo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            disabled={uploading}
            className="w-11 h-11 rounded-full bg-[#C4B5E0] text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform disabled:opacity-50"
            title="Choose from gallery"
          >
            {uploading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin block" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </button>
        </div>

        {/* Camera input (opens camera directly on mobile) */}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        {/* Gallery input */}
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#C4B5E0] border-t-transparent animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 space-y-3 px-5">
          <div className="text-5xl">📷</div>
          <p className="text-sm font-bold text-[#2B3A4A]/40">No moments yet</p>
          <p className="text-xs text-[#2B3A4A]/30 font-medium">
            Tap the gallery icon to share your first photo
          </p>
        </div>
      ) : (
        <div className="space-y-4 px-5">
          {photos.map(p => {
            const isMe = p.slot === slot
            const authorName = isMe ? myName : partnerName
            return (
              <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#EDE8F5]">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white ${isMe ? 'bg-[#C4B5E0]' : 'bg-[#9B88C8]'}`}>
                    {(authorName || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#2B3A4A]">{authorName || (isMe ? 'You' : 'Partner')}</p>
                    <p className="text-[10px] text-[#2B3A4A]/40 font-medium">{fmtRelative(p.taken_at)}</p>
                  </div>
                  {isMe && (
                    <button
                      onClick={() => handleDelete(p)}
                      className="text-[#2B3A4A]/20 hover:text-red-400 transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center"
                    >
                      ···
                    </button>
                  )}
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.caption || ''}
                  className="w-full object-cover cursor-pointer"
                  style={{ maxHeight: '480px' }}
                  onClick={() => setSelected(p)}
                  loading="lazy"
                />

                {p.caption && (
                  <div className="px-4 py-3">
                    <p className="text-sm text-[#2B3A4A] font-medium">{p.caption}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Caption + upload preview sheet */}
      {pendingFile && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end">
          <div className="w-full bg-[#FBF8F4] rounded-t-3xl p-6 space-y-4 max-w-sm mx-auto">
            <div className="w-10 h-1 bg-[#2B3A4A]/10 rounded-full mx-auto" />
            <h3 className="font-extrabold text-[#2B3A4A] text-lg">Share this moment</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(pendingFile)}
              alt="preview"
              className="w-full rounded-2xl object-cover"
              style={{ maxHeight: '280px' }}
            />
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Add a caption… (optional)"
              className="w-full h-12 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-sm font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setPendingFile(null); setCaption('') }}
                className="flex-1 h-12 rounded-2xl border border-[#EDE8F5] text-[#2B3A4A]/60 font-bold text-sm active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 h-12 rounded-2xl bg-[#C4B5E0] text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {uploading ? 'Sharing…' : 'Share 💜'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setSelected(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.url}
            alt={selected.caption}
            className="max-w-full max-h-[80vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          {selected.caption && (
            <p className="text-white/80 text-sm font-medium mt-4 px-6 text-center" onClick={e => e.stopPropagation()}>
              {selected.caption}
            </p>
          )}
          <button
            onClick={() => setSelected(null)}
            className="absolute top-6 right-6 text-white/70 text-2xl font-bold w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  )
}
