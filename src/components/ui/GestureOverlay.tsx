interface Props {
  active: boolean
  countdownMs?: number     // Phase 2 카운트다운 (ms)
  handGuide?: boolean
}

export default function GestureOverlay({ active, countdownMs, handGuide }: Props) {
  if (!active) return null
  const secs = countdownMs != null ? (countdownMs / 1000).toFixed(1) : null

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
      {handGuide && (
        <p className="text-gray-400 font-mono text-xs text-center mb-2 animate-pulse">
          카메라에 손을 보여주세요
        </p>
      )}
      {secs != null && (
        <div className="text-red-400 font-mono text-2xl">{secs}s</div>
      )}
    </div>
  )
}
