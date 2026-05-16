import { useEffect, useState } from 'react'
import ScenePlayer from './ScenePlayer'

interface Props { onComplete: () => void }

export default function WinCutscene({ onComplete }: Props) {
  const [crackLevel, setCrackLevel] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setCrackLevel(1), 200),
      setTimeout(() => setCrackLevel(2), 400),
      setTimeout(() => setCrackLevel(3), 600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="absolute inset-0 z-50">
      {/* 거울 파손 배경 */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: 'url(/images/bg_win_mirror.png)' }}
      />
      {/* 균열 오버레이 3단계 */}
      {crackLevel >= 1 && (
        <div className="absolute inset-0 bg-center bg-cover opacity-60"
          style={{ backgroundImage: 'url(/images/crack_1.png)' }} />
      )}
      {crackLevel >= 2 && (
        <div className="absolute inset-0 bg-center bg-cover opacity-80"
          style={{ backgroundImage: 'url(/images/crack_2.png)' }} />
      )}
      {crackLevel >= 3 && (
        <div className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: 'url(/images/crack_3.png)' }} />
      )}
      <ScenePlayer sceneKey="WIN" onComplete={onComplete} />
    </div>
  )
}
