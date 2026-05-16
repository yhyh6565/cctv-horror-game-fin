import { useState } from 'react'
import { matchKeyword } from '../../data/endingKeywords'

interface Props {
  onAnswer: (answer: string) => void
}

export default function QuestionInput({ onAnswer }: Props) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!question.trim()) return
    const keyword = matchKeyword(question)
    if (keyword) { onAnswer(keyword); return }

    setLoading(true)
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const { answer } = await res.json()
      onAnswer(answer)
    } catch {
      onAnswer('알 수 없다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 w-80">
      <input
        className="w-full bg-black/80 border border-gray-600 text-white p-3 text-sm font-mono rounded"
        placeholder="질문을 적으세요..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        autoFocus
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-2 w-full bg-gray-800 text-gray-300 text-xs py-2 rounded hover:bg-gray-700"
      >
        {loading ? '…' : '묻기'}
      </button>
    </div>
  )
}
