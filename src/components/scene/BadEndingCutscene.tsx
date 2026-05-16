import { useState } from 'react'
import ScenePlayer from './ScenePlayer'

interface Props { onComplete: () => void }

export default function BadEndingCutscene({ onComplete }: Props) {
  const [showHand, setShowHand] = useState(false)

  const handleTextComplete = () => {
    setShowHand(true)
    setTimeout(onComplete, 3000)
  }

  return (
    <div className="absolute inset-0 z-50 bg-black">
      {!showHand ? (
        <ScenePlayer sceneKey="BAD_ENDING_TEXT" onComplete={handleTextComplete} />
      ) : (
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: 'url(/images/bg_bad_ending.png)' }}
        />
      )}
    </div>
  )
}
