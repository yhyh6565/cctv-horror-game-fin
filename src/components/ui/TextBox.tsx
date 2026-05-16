import { useEffect, useState } from 'react'
import type { ScriptLine } from '../../data/scenes'

interface Props {
  line: ScriptLine | null
  onComplete: () => void
}

const TYPE_SPEED: Record<string, number> = {
  narration: 30,
  inner: 35,
  system: 25,
  ghost: 60,       // 느리게
  reveal: 50,
  ghost_takeover: 30,
}

export default function TextBox({ line, onComplete }: Props) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!line) return
    setDisplayed('')
    setDone(false)
    const fullText = line.type === 'ghost_takeover'
      ? line.text + ' ' + (line.ghostWord ?? '')
      : line.text
    let i = 0
    const speed = TYPE_SPEED[line.type] ?? 30
    const timer = setInterval(() => {
      i++
      setDisplayed(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(timer)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [line])

  if (!line) return null

  const handleClick = () => {
    if (done) onComplete()
    else {
      // 스킵: 전체 텍스트 즉시 출력
      const fullText = line.type === 'ghost_takeover'
        ? line.text + ' ' + (line.ghostWord ?? '')
        : line.text
      setDisplayed(fullText)
      setDone(true)
    }
  }

  return (
    <div
      onClick={handleClick}
      className="absolute bottom-0 left-0 right-0 z-50 p-4 cursor-pointer"
    >
      <div className="bg-black/80 border border-gray-700 rounded p-4 min-h-[80px]">
        {line.type === 'system' && (
          <p className="text-yellow-400 font-mono text-sm leading-relaxed whitespace-pre-line">
            {displayed}
          </p>
        )}
        {line.type === 'narration' && (
          <p className="text-white text-sm leading-relaxed">{displayed}</p>
        )}
        {line.type === 'inner' && (
          <p className="text-gray-300 italic text-sm leading-relaxed">{displayed}</p>
        )}
        {line.type === 'ghost' && (
          <p className="text-gray-500 italic text-sm leading-relaxed tracking-wide">{displayed}</p>
        )}
        {line.type === 'reveal' && (
          <p className="text-red-400 font-bold text-base leading-relaxed">{displayed}</p>
        )}
        {line.type === 'ghost_takeover' && (
          <GhostTakeoverLine line={line} displayed={displayed} />
        )}
        {done && (
          <span className="text-gray-500 text-xs ml-2">▶</span>
        )}
      </div>
    </div>
  )
}

function GhostTakeoverLine({ line, displayed }: { line: ScriptLine; displayed: string }) {
  const normalPart = line.text

  if (displayed.length <= normalPart.length) {
    return (
      <p className="text-gray-300 italic text-sm">
        {displayed}
      </p>
    )
  }

  const ghostDisplayed = displayed.slice(normalPart.length + 1)
  return (
    <p className="text-gray-300 italic text-sm">
      {normalPart}{' '}
      <span className="text-red-500 font-bold animate-pulse blur-[0.3px]">
        {ghostDisplayed}
      </span>
    </p>
  )
}
