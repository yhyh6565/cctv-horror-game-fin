export type SceneId =
  | 'IDLE'
  | 'SCENE_01' | 'SCENE_02' | 'SCENE_03'
  | 'PHASE_1_RPS'
  | 'PHASE_2_ENTRY'
  | 'PHASE_2_RPS'
  | 'PHASE_2_QUESTION'
  | 'PHASE_2_REACTION'
  | 'WIN_CUTSCENE'
  | 'BAD_ENDING'
  | 'DEAD_ENDING'
  | 'JUMP_SCARE'
  | 'ENDING_SCREEN_BAD'
  | 'ENDING_SCREEN_DEAD'
  | 'ENDING_SCREEN_JUMP'
  | 'ESCAPE_FROST'
  | 'ESCAPE_HOLD'
  | 'TRUE_ENDING'

export type Gesture = 'rock' | 'paper' | 'scissors' | 'none'
export type TextLineType = 'narration' | 'inner' | 'system' | 'ghost' | 'reveal' | 'ghost_takeover'

export interface Phase1State {
  round: number    // 1-5
  losses: number   // 0-4
}

export interface Phase2State {
  round: number            // 1-3
  losses: number           // 0-2 (3번째 패배 = Bad Ending)
  questionsAnswered: number
  insightTriggered: boolean
}

export interface GameState {
  scene: SceneId
  phase1: Phase1State
  phase2: Phase2State
  handLostSeconds: number
  pendingQuestion: string | null  // Phase 2 귀신 질문
  pendingReaction: string | null
  phase2SignalActive: boolean
  phase2SignalMs: number  // remaining ms for Phase 2 signal window (1500 → 0)
}
