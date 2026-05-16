import { useState, useEffect } from 'react'
import { SCENES } from '../../data/scenes'
import TextBox from '../ui/TextBox'

interface Props {
  sceneKey: string
  onComplete: () => void
}

export default function ScenePlayer({ sceneKey, onComplete }: Props) {
  const [lineIndex, setLineIndex] = useState(0)
  const lines = SCENES[sceneKey] ?? []
  const currentLine = lines[lineIndex] ?? null

  useEffect(() => {
    setLineIndex(0)
  }, [sceneKey])

  const handleLineComplete = () => {
    if (lineIndex < lines.length - 1) {
      setLineIndex(i => i + 1)
    } else {
      onComplete()
    }
  }

  return (
    <TextBox line={currentLine} onComplete={handleLineComplete} />
  )
}
