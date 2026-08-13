'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession, useToast } from '@/lib/store'
import { useRealtime } from '@/hooks/useRealtime'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { PullIndicator } from '@/components/PullIndicator'

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
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

function PhotoStack({ photos, mySlot, myName, partnerName, dismissed, onDismiss, onOpen }: {
  photos: Photo[]
  mySlot: string
  myName: string
  partnerName: string
  dismissed: Set<string>
  onDismiss: (id: string) => void
  onOpen: (p: Photo) => void
}) {
  const [dragX, setDragX] = useState(0)
  const [flying, setFlying] = useState<null | 'left' | 'right'>(null)
  const startX = useRef(0)
  const dragging = useRef(false)

  const stack = photos.filter(p => p.slot !== mySlot && !dismissed.has(p.id))

  const fly = useCallback((dir: 'left' | 'right') => {
    if (!stack.length || flying) return
    setFlying(dir)
    setTimeout(() => {
      onDismiss(stack[0].id)
      setFlying(null)
      setDragX(0)
    }, 280)
  }, [stack, flying, onDismiss])

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    dragging.current = true
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return
    setDragX(e.touches[0].clientX - startX.current)
  }
  function onTouchEnd() {
    dragging.current = false
    if (Math.abs(dragX) > 72) fly(dragX > 0 ? 'right' : 'left')
    else setDragX(0)
  }
  function onMouseDown(e: React.MouseEvent) {
    startX.current = e.clientX
    dragging.current = true
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return
    setDragX(e.clientX - startX.current)
  }
  function onMouseUp() {
    dragging.current = false
    if (Math.abs(dragX) > 72) fly(dragX > 0 ? 'right' : 'left')
    else setDragX(0)
  }

  if (!stack.length) return null

  const top = stack[0]
  const authorName = top.slot === mySlot ? myName : partnerName
  const rotate = (dragX / 420) * 14
  const tx = flying === 'left' ? -520 : flying === 'right' ? 520 : dragX

  return (
    <div className="px-5 mb-2">
      <div className="relative" style={{ height: 420 }}>
        {stack[2] && (
          <div
            className="absolute inset-0 bg-white rounded-3xl border border-[#F0EDF8] shadow-sm"
            style={{ transform: 'scale(0.87) translateY(18px) rotate(-3deg)', transformOrigin: 'bottom center', zIndex: 1 }}
          />
        )}
        {stack[1] && (
          <div
            className="absolute inset-0 bg-white rounded-3xl border border-[#F0EDF8] shadow-sm"
            style={{ transform: 'scale(0.93) translateY(9px) rotate(2deg)', transformOrigin: 'bottom center', zIndex: 2 }}
          />
        )}
        <div
          className="absolute inset-0 bg-white rounded-3xl border border-[#F0EDF8] shadow-md overflow-hidden select-none"
          style={{
            transform: `translateX(${tx}px) rotate(${rotate}deg)`,
            transition: flying ? 'all 0.28s cubic-bezier(.4,0,.2,1)' : !dragging.current ? 'transform 0.18s ease' : 'none',
            zIndex: 3,
            cursor: dragging.current ? 'grabbing' : 'grab',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={top.url}
            alt={top.caption || ''}
            className="w-full object-cover pointer-events-none"
            style={{ height: 320 }}
            draggable={false}
            onClick={() => onOpen(top)}
          />
          <div className="px-4 pt-3 pb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#2B3A4A] leading-none">{authorName}</p>
              <p className="text-[11px] text-[#2B3A4A]/40 font-medium mt-0.5">{fmtRelative(top.taken_at)}</p>
              {top.caption && (
                <p className="text-sm text-[#2B3A4A]/70 font-medium mt-1 truncate">{top.caption}</p>
              )}
            </div>
            <button
              onClick={e => { e.stopPropagation(); fly('right') }}
              className="shrink-0 w-9 h-9 rounded-full bg-[#F0EDF8] text-[#9B88C8] flex items-center justify-center active:scale-95 transition-transform"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {stack.length > 1 && (
        <p className="text-center text-[11px] font-semibold text-[#2B3A4A]/30 mt-2">
          {stack.length} moment{stack.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [showGallery, setShowGallery] = useState(false)

  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const dismissKey = coupleId && slot ? `dismissed_${coupleId}_${slot}` : null

  useEffect(() => {
    if (!dismissKey) return
    try {
      const stored = localStorage.getItem(dismissKey)
      if (stored) setDismissed(new Set(JSON.parse(stored)))
    } catch {}
  }, [dismissKey])

  function handleDismiss(id: string) {
    setDismissed(prev => {
      const next = new Set([...prev, id])
      if (dismissKey) localStorage.setItem(dismissKey, JSON.stringify([...next]))
      return next
    })
  }

  async function loadPhotos() {
    const res = await fetch('/api/photos')
    if (res.ok) setPhotos(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadPhotos() }, [])
  useRealtime(coupleId, (table) => { if (table === 'photos') loadPhotos() })

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
        show('Moment shared')
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

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const res = await fetch('/api/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setPhotos(p => p.filter(x => x.id !== id))
        setSelected(null)
        setConfirmDeleteId(null)
        handleDismiss(id)
      } else {
        show('Could not delete')
      }
    } catch {
      show('Could not connect')
    } finally {
      setDeleting(false)
    }
  }

  const stackPhotos = photos.filter(p => p.slot !== slot && !dismissed.has(p.id))
  const hasStack = stackPhotos.length > 0
  const { pullY, refreshing } = usePullToRefresh(loadPhotos)

  return (
    <main className="pb-24 max-w-sm mx-auto">
      <PullIndicator pullY={pullY} refreshing={refreshing} />
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 mb-5">
        <div>
          <p className="text-xs font-medium text-[#2B3A4A]/40">Moments</p>
          <h1 className="text-2xl font-extrabold text-[#2B3A4A] mt-0.5">Photos</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => cameraRef.current?.click()}
            disabled={uploading}
            className="w-10 h-10 rounded-full bg-[#F0EDF8] text-[#9B88C8] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            disabled={uploading}
            className="w-10 h-10 rounded-full bg-[#C4B5E0] text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {uploading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin block" />
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </button>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#C4B5E0] border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Card stack */}
          {hasStack && !showGallery && (
            <PhotoStack
              photos={photos}
              mySlot={slot ?? ''}
              myName={myName}
              partnerName={partnerName}
              dismissed={dismissed}
              onDismiss={handleDismiss}
              onOpen={setSelected}
            />
          )}

          {/* All caught up */}
          {!hasStack && !showGallery && photos.length > 0 && (
            <div className="text-center py-10 px-5">
              <p className="text-sm font-bold text-[#2B3A4A]/30">All caught up</p>
            </div>
          )}

          {/* Empty state */}
          {photos.length === 0 && (
            <div className="text-center py-16 space-y-2 px-5">
              <p className="text-sm font-semibold text-[#2B3A4A]/40">No moments yet</p>
              <p className="text-xs text-[#2B3A4A]/30 font-medium">
                Tap the gallery button above to share your first photo
              </p>
            </div>
          )}

          {/* Gallery toggle */}
          {photos.length > 0 && (
            <div className="px-5 mt-3">
              <button
                onClick={() => setShowGallery(v => !v)}
                className="w-full h-11 rounded-2xl border border-[#EDE8F5] text-[#9B88C8] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                {showGallery ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to moments
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    View all photos ({photos.length})
                  </>
                )}
              </button>
            </div>
          )}

          {/* Gallery grid */}
          {showGallery && (
            <div className="grid grid-cols-3 gap-0.5 mt-4">
              {photos.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="relative aspect-square overflow-hidden bg-[#F0EDF8] active:opacity-80 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.caption || ''}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Caption + upload preview */}
      {pendingFile && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end">
          <div className="w-full bg-[#FBF8F4] rounded-t-3xl p-6 space-y-4 max-w-sm mx-auto">
            <div className="w-10 h-1 bg-[#2B3A4A]/10 rounded-full mx-auto" />
            <h3 className="font-bold text-[#2B3A4A] text-base">Share this moment</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(pendingFile)} alt="preview" className="w-full rounded-2xl object-cover" style={{ maxHeight: 280 }} />
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Add a caption… (optional)"
              className="w-full h-12 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-sm font-medium text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
            />
            <div className="flex gap-3">
              <button onClick={() => { setPendingFile(null); setCaption('') }} className="flex-1 h-12 rounded-2xl border border-[#EDE8F5] text-[#2B3A4A]/60 font-semibold text-sm active:scale-[0.98] transition-transform">
                Cancel
              </button>
              <button onClick={handleUpload} disabled={uploading} className="flex-1 h-12 rounded-2xl bg-[#C4B5E0] text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50">
                {uploading ? 'Sharing…' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen lightbox */}
      {selected && (() => {
        const isMe = selected.slot === slot
        const authorName = isMe ? myName : partnerName
        const isConfirming = confirmDeleteId === selected.id
        return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => { setSelected(null); setConfirmDeleteId(null) }}>
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 pt-10 pb-3 shrink-0" onClick={e => e.stopPropagation()}>
              <div>
                <p className="text-white text-sm font-bold leading-none">{authorName || (isMe ? 'You' : 'Partner')}</p>
                <p className="text-white/40 text-[11px] font-medium mt-0.5">{fmtRelative(selected.taken_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                {isMe && !isConfirming && (
                  <button
                    onClick={() => setConfirmDeleteId(selected.id)}
                    className="text-white/40 w-9 h-9 flex items-center justify-center"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                )}
                <button onClick={() => { setSelected(null); setConfirmDeleteId(null) }} className="text-white/60 w-9 h-9 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden px-2" onClick={e => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.url} alt={selected.caption} className="max-w-full max-h-full object-contain rounded-xl" />
            </div>

            {/* Bottom: caption + delete confirm */}
            <div className="shrink-0 px-5 pt-3 pb-10" onClick={e => e.stopPropagation()}>
              {selected.caption && (
                <p className="text-white/70 text-sm font-medium mb-3 text-center">{selected.caption}</p>
              )}
              {isConfirming && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 h-11 rounded-2xl border border-white/20 text-white/60 font-semibold text-sm"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleting}
                    className="flex-1 h-11 rounded-2xl bg-red-500/80 text-white font-semibold text-sm disabled:opacity-50"
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </main>
  )
}
