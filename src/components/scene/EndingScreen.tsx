import { useEffect, useState } from 'react'

type EndingType = 'bad' | 'dead' | 'jump'

interface Props {
  endingType: EndingType
  onRetry: () => void
}

const TRANSCRIPTS: Record<EndingType, string> = {
  bad: `탐사기록 #47 — Qterw-D-718
담당: 김솔음 (현장탐사팀 D조)

거울 속 존재의 질문에 총 3회 응답 완료.
이후 직원의 발화 패턴에 이상 징후 감지됨.
"나는 지금 아주 행복하다."
"빨리 집에 가지 않아도 된다."
교신 정상 종료 여부 불명확.

[ 이후 기록 없음 ]
[ 꿈결 수집기 자동 회수 완료 ]`,

  dead: `탐사기록 #47 — Qterw-D-718
담당: 김솔음 (현장탐사팀 D조)

거울 속 존재가 응답을 요구함.
제한 시간 내 미응답.
판정승이 상대에게 이전됨.
직원의 마지막 녹음: 정적 3.2초.

[ 이후 기록 없음 ]
[ 꿈결 수집기 자동 회수 완료 ]`,

  jump: `탐사기록 #47 — Qterw-D-718
담당: 김솔음 (현장탐사팀 D조)

의식 진행 중 손 인식 신호 소실.
경과 시간: 5.1초.
거울 속 존재가 의식 규칙 위반을 선언함.
이후 교신 두절.

[ 이후 기록 없음 ]
[ 꿈결 수집기 자동 회수 완료 ]`,
}

type Phase = 'silent' | 'collecting' | 'collected' | 'typing' | 'done'

export default function EndingScreen({ endingType, onRetry }: Props) {
  const [phase, setPhase] = useState<Phase>('silent')
  const [typed, setTyped] = useState('')
  const [showRetry, setShowRetry] = useState(false)

  const fullText = TRANSCRIPTS[endingType]

  useEffect(() => {
    // 1초 정적
    const t1 = setTimeout(() => setPhase('collecting'), 1000)
    // 1.5초 수집 중
    const t2 = setTimeout(() => setPhase('collected'), 2500)
    // 0.5초 유지 후 타이핑 시작
    const t3 = setTimeout(() => setPhase('typing'), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  // 타자기 효과
  useEffect(() => {
    if (phase !== 'typing') return
    let i = 0
    const interval = setInterval(() => {
      i++
      setTyped(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(interval)
        setPhase('done')
      }
    }, 40)
    return () => clearInterval(interval)
  }, [phase, fullText])

  // 타이핑 완료 후 0.8초 후 버튼 표시
  useEffect(() => {
    if (phase !== 'done') return
    const t = setTimeout(() => setShowRetry(true), 800)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-lg space-y-4">

        {/* 수집기 상태 */}
        {phase === 'collecting' && (
          <p className="font-mono text-red-600 text-xs animate-pulse">
            [ 꿈결 수집기 신호 감지 중... ]
          </p>
        )}
        {(phase === 'collected' || phase === 'typing' || phase === 'done') && (
          <p className="font-mono text-red-600 text-xs">
            [ 자동 회수 완료 ]
          </p>
        )}

        {/* 트랜스크립트 */}
        {(phase === 'typing' || phase === 'done') && (
          <pre
            className="font-mono text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: 'rgba(156,163,175,1)' }}
          >
            {typed.split('\n').map((line, i) => {
              const isSystem = line.startsWith('[') || line.startsWith('탐사기록')
              return (
                <span
                  key={i}
                  className={isSystem ? 'text-red-600' : 'text-gray-400'}
                >
                  {line}{'\n'}
                </span>
              )
            })}
          </pre>
        )}

        {/* 재시작 버튼 */}
        {showRetry && (
          <button
            onClick={onRetry}
            className="mt-6 font-mono text-sm text-gray-500 border border-gray-700 px-6 py-2
                       hover:text-white hover:border-white transition-colors duration-300"
            style={{ opacity: showRetry ? 1 : 0, transition: 'opacity 0.5s' }}
          >
            다시 하기
          </button>
        )}
      </div>
    </div>
  )
}
