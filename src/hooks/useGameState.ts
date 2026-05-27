import { useState, useCallback } from 'react'
import type { GameState, SceneId, Gesture } from '../types/game'
import { getGhostQuestion } from '../data/ghostQuestions'

export function resolvePhase1(gesture: Gesture): 'tie' | 'loss' {
  return gesture === 'paper' ? 'tie' : 'loss'
}

export function resolvePhase2(
  gesture: Gesture,
  round: number,
  _insightTriggered: boolean
): 'win' | 'loss' {
  if (gesture !== 'scissors') return 'loss'
  if (round === 3) return 'win'               // 펜 트릭 확정승
  return Math.random() < 0.2 ? 'win' : 'loss' // 20% 랜덤 승리
}

const INITIAL_STATE: GameState = {
  scene: 'IDLE',
  phase1: { round: 1, losses: 0 },
  phase2: { round: 1, losses: 0, questionsAnswered: 0, insightTriggered: false },
  handLostSeconds: 0,
  pendingQuestion: null,
  pendingReaction: null,
  phase2SignalActive: false,
  phase2SignalMs: 0,
}

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE)

  const advance = useCallback((next: Partial<GameState> | ((s: GameState) => Partial<GameState>)) => {
    setState(s => ({ ...s, ...(typeof next === 'function' ? next(s) : next) }))
  }, [])

  const goTo = useCallback((scene: SceneId) => advance({ scene }), [advance])

  const submitPhase1Gesture = useCallback((gesture: Gesture) => {
    setState(s => {
      const result = resolvePhase1(gesture)
      const newRound = s.phase1.round + 1
      const newLosses = result === 'loss' ? s.phase1.losses + 1 : s.phase1.losses
      const toPhase2 = newLosses >= 4 || newRound > 5
      return {
        ...s,
        phase1: { round: newRound, losses: newLosses },
        scene: toPhase2 ? 'PHASE_2_ENTRY' : 'PHASE_1_RPS',
      }
    })
  }, [])

  const submitPhase2Gesture = useCallback((gesture: Gesture, precomputedResult?: 'win' | 'loss') => {
    setState(s => {
      const { round, losses, questionsAnswered, insightTriggered } = s.phase2
      const result = precomputedResult ?? resolvePhase2(gesture, round, insightTriggered)

      if (result === 'win') {
        return { ...s, scene: 'WIN_CUTSCENE' }
      }

      // loss
      const newLosses = losses + 1
      const newQA = questionsAnswered + 1

      if (newLosses >= 3 || round >= 3) {
        return { ...s, scene: 'BAD_ENDING' }
      }

      const triggerInsight = round === 1
      return {
        ...s,
        phase2: {
          round: round + 1,
          losses: newLosses,
          questionsAnswered: newQA,
          insightTriggered: insightTriggered || triggerInsight,
        },
        pendingQuestion: getGhostQuestion(questionsAnswered)?.question ?? null,
        scene: 'PHASE_2_QUESTION',
        phase2SignalActive: false,
        phase2SignalMs: 0,
      }
    })
  }, [])

  const updateHandLost = useCallback((seconds: number) => {
    setState(s => {
      if (seconds >= 5) return { ...s, scene: 'JUMP_SCARE', handLostSeconds: seconds }
      return { ...s, handLostSeconds: seconds }
    })
  }, [])

  const setReaction = useCallback((reaction: string | null) => {
    advance({ pendingReaction: reaction })
  }, [advance])

  const startPhase2Signal = useCallback(() => {
    advance({ phase2SignalActive: true, phase2SignalMs: 1500 })
  }, [advance])

  const tickPhase2Signal = useCallback((deltaMs: number) => {
    setState(s => {
      if (!s.phase2SignalActive) return s
      const remaining = s.phase2SignalMs - deltaMs
      if (remaining <= 0) return { ...s, phase2SignalActive: false, phase2SignalMs: 0, scene: 'DEAD_ENDING' }
      return { ...s, phase2SignalMs: remaining }
    })
  }, [])

  return { state, goTo, submitPhase1Gesture, submitPhase2Gesture, updateHandLost, startPhase2Signal, tickPhase2Signal, setReaction }
}
