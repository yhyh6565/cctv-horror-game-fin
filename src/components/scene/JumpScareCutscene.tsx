import { useEffect } from 'react'

interface Props { onComplete?: () => void }

export default function JumpScareCutscene({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 3000)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div className="absolute inset-0 z-50 bg-white">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: 'url(/images/bg_bad_ending.png)', filter: 'contrast(2) saturate(0)' }}
      />
    </div>
  )
}
