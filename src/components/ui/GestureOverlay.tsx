import type { Gesture } from '../../types/game'

interface Props {
  active: boolean
  holdProgress: number     // 0-1 (800ms hold 진행률)
  countdownMs?: number     // Phase 2 카운트다운 (ms), null이면 표시 안 함
  currentGesture: Gesture
}

const GESTURE_LABEL: Record<Gesture, string> = {
  rock: '✊ 바위', paper: '🖐 보', scissors: '✌ 가위', none: '손을 보여주세요',
}

export default function GestureOverlay({ active, holdProgress, countdownMs, currentGesture }: Props) {
  if (!active) return null
  const secs = countdownMs != null ? (countdownMs / 1000).toFixed(1) : null

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
      {secs != null && (
        <div className="text-red-400 font-mono text-2xl">{secs}s</div>
      )}
      <div className="text-white text-sm">{GESTURE_LABEL[currentGesture]}</div>
      {holdProgress > 0 && (
        <div className="w-48 h-2 bg-gray-700 rounded overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all"
            style={{ width: `${holdProgress * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
