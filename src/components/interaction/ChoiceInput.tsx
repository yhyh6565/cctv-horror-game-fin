import { useState } from 'react'
import type { GhostChoice } from '../../data/ghostQuestions'

interface Props {
  question: string
  choices: GhostChoice[]
  onSelect: (reaction: string) => void
}

export default function ChoiceInput({ question, choices, onSelect }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  function handleSelect(index: number, reaction: string) {
    if (selected !== null) return  // 이미 선택함
    setSelected(index)
    setTimeout(() => onSelect(reaction), 600)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-end pb-12 px-6">
      {/* 귀신 질문 */}
      <div className="mb-6 text-center">
        <p
          className="font-mono text-red-400 text-lg tracking-widest"
          style={{ textShadow: '0 0 12px rgba(220,0,0,0.6)' }}
        >
          {question}
        </p>
      </div>

      {/* 선택지 목록 */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {choices.map((choice, i) => {
          const isSelected = selected === i
          const isDimmed = selected !== null && selected !== i
          return (
            <button
              key={i}
              onClick={() => handleSelect(i, choice.reaction)}
              disabled={selected !== null}
              className="w-full text-left px-4 py-3 font-mono text-sm tracking-wide transition-all duration-300"
              style={{
                border: `1px solid ${isSelected ? 'rgba(200,30,30,0.9)' : 'rgba(180,0,0,0.35)'}`,
                background: 'transparent',
                color: isDimmed ? 'rgba(255,255,255,0.2)' : isSelected ? 'rgba(220,80,80,1)' : 'rgba(255,255,255,0.75)',
                textShadow: isSelected ? '0 0 8px rgba(200,30,30,0.8)' : 'none',
                cursor: selected !== null ? 'default' : 'pointer',
              }}
            >
              {choice.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
