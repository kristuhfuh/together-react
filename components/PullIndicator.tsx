export function PullIndicator({ pullY, refreshing }: { pullY: number; refreshing: boolean }) {
  if (pullY === 0 && !refreshing) return null
  return (
    <div
      className="flex items-center justify-center overflow-hidden -mx-5"
      style={{
        height: refreshing ? 52 : pullY,
        transition: !refreshing && pullY === 0 ? 'height 0.2s ease' : 'none',
      }}
    >
      <div
        className={`w-6 h-6 rounded-full border-2 border-[#C4B5E0] border-t-transparent ${refreshing ? 'animate-spin' : ''}`}
        style={{ opacity: Math.min(pullY / 52, 1) }}
      />
    </div>
  )
}
