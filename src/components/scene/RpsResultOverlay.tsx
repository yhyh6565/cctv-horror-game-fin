import { useEffect, useState } from 'react'
import type { Gesture } from '../../types/game'

type Phase = 'phase1' | 'phase2'
type Result = 'win' | 'loss' | 'tie'

interface Props {
  playerGesture: Gesture
  result: Result
  phase: Phase
  onDone: () => void  // 1.8초 후 호출
}

const GESTURE_KO: Record<Gesture, string> = {
  rock: '바위',
  paper: '보',
  scissors: '가위',
  none: '?',
}

function getGhostMove(playerGesture: Gesture, result: Result, phase: Phase): string {
  if (phase === 'phase1') {
    if (result === 'tie') return '보'
    if (result === 'loss' && playerGesture === 'rock') return '보'
    if (result === 'loss' && playerGesture === 'scissors') return '바위'
    return '?'
  }
  // phase2
  if (result === 'win') return '보'
  if (result === 'loss' && playerGesture === 'scissors') return '바위'
  if (result === 'loss' && playerGesture === 'rock') return '보'
  return '???'  // paper+loss: 초자연적 승리
}

const RESULT_KO: Record<Result, string> = {
  win: '이겼다.',
  loss: '졌다.',
  tie: '비겼다.',
}

const RESULT_COLOR: Record<Result, string> = {
  win: 'rgba(255,255,255,1)',
  loss: 'rgba(210,40,40,1)',
  tie: 'rgba(160,160,160,1)',
}

export default function RpsResultOverlay({ playerGesture, result, phase, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 0.5초 held breath 후 등장
    const showTimer = setTimeout(() => setVisible(true), 500)
    // 0.5 + 1.8 = 2.3초 후 onDone
    const doneTimer = setTimeout(() => onDone(), 2300)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  const ghostMove = getGhostMove(playerGesture, result, phase)

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.75)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease-in',
      }}
    >
      {/* 패 표시 */}
      <div
        className="flex gap-12 mb-6 font-mono tracking-widest"
        style={{ fontFamily: "'Special Elite', monospace", fontSize: '1.5rem', color: 'rgba(255,255,255,0.85)' }}
      >
        <span>나: {GESTURE_KO[playerGesture]}</span>
        <span>귀신: {ghostMove}</span>
      </div>

      {/* 결과 */}
      <p
        className="font-mono tracking-widest"
        style={{
          fontFamily: "'Special Elite', monospace",
          fontSize: '2.5rem',
          color: RESULT_COLOR[result],
          textShadow: result === 'loss' ? '0 0 16px rgba(200,0,0,0.7)' : 'none',
        }}
      >
        {RESULT_KO[result]}
      </p>
    </div>
  )
}
