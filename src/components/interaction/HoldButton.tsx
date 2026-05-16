import { useEffect, useRef, useState } from 'react'

interface Props {
  isPointing: boolean   // 검지 펴기 감지 여부
  holdDurationMs?: number  // default 3000
  onComplete: () => void
  onFail: () => void
}

export default function HoldButton({ isPointing, holdDurationMs = 3000, onComplete, onFail }: Props) {
  const [progress, setProgress] = useState(0)
  const startRef = useRef<number | null>(null)
  const completedRef = useRef(false)
  const failedRef = useRef(false)

  useEffect(() => {
    if (completedRef.current || failedRef.current) return

    if (isPointing) {
      if (!startRef.current) startRef.current = Date.now()
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(elapsed / holdDurationMs, 1)
      setProgress(pct)
      if (pct >= 1) {
        completedRef.current = true
        onComplete()
      }
    } else {
      if (startRef.current !== null) {
        // Released mid-hold = fail
        failedRef.current = true
        onFail()
      }
    }
  })

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      <div className="text-white text-sm">☝ 검지를 들고 유지하세요</div>
      <div className="w-48 h-3 bg-gray-700 rounded overflow-hidden">
        <div
          className="h-full bg-green-400 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="text-gray-400 text-xs">{Math.round(progress * 3)}s / 3s</div>
    </div>
  )
}
