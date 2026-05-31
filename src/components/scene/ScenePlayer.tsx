import { useState, useEffect } from 'react'
import { SCENES } from '../../data/scenes'
import TextBox from '../ui/TextBox'
import TornNotice from './TornNotice'

interface Props {
  sceneKey: string
  onComplete: () => void
  onSound?: (key: string) => void
}

export default function ScenePlayer({ sceneKey, onComplete, onSound }: Props) {
  const [lineIndex, setLineIndex] = useState(0)
  const lines = SCENES[sceneKey] ?? []
  const currentLine = lines[lineIndex] ?? null

  useEffect(() => {
    setLineIndex(0)
  }, [sceneKey])

  // 라인 전환 시 sound 트리거
  useEffect(() => {
    if (currentLine?.sound && onSound) {
      onSound(currentLine.sound)
    }
  }, [lineIndex, sceneKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLineComplete = () => {
    if (lineIndex < lines.length - 1) {
      setLineIndex(i => i + 1)
    } else {
      onComplete()
    }
  }

  if (currentLine?.type === 'notice') {
    return <TornNotice text={currentLine.text} onComplete={handleLineComplete} />
  }

  return (
    <TextBox
      line={currentLine}
      onComplete={handleLineComplete}
    />
  )
}
