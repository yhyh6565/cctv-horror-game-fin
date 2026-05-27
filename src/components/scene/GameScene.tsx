import { useRef, useState, useEffect } from 'react'
import { useGameState, resolvePhase2 } from '../../hooks/useGameState'
import { useHandTracking } from '../../hooks/useHandTracking'
import { useFaceTracking } from '../../hooks/useFaceTracking'
import { useSoundManager } from '../../hooks/useSoundManager'
import type { Gesture } from '../../types/game'
import Background from './Background'
import GhostSilhouette from './GhostSilhouette'
import CctvFilter from './CctvFilter'
import ScenePlayer from './ScenePlayer'
import WinCutscene from './WinCutscene'
import BadEndingCutscene from './BadEndingCutscene'
import DeadEndingCutscene from './DeadEndingCutscene'
import JumpScareCutscene from './JumpScareCutscene'
import EndingScreen from './EndingScreen'
import FloorDisplay from '../ui/FloorDisplay'
import GestureOverlay from '../ui/GestureOverlay'
import FrostWipe from '../interaction/FrostWipe'
import HoldButton from '../interaction/HoldButton'
import TextBox from '../ui/TextBox'
import QuestionInput from '../interaction/QuestionInput'
import RpsResultOverlay from './RpsResultOverlay'
import ChoiceInput from '../interaction/ChoiceInput'
import { getGhostQuestion } from '../../data/ghostQuestions'
import type { GhostQuestion } from '../../data/ghostQuestions'

const PHASE1_PARAMS = [
  { bg: 'bg_0', ghostSize: 0, ghostOpacity: 0, floor: '1F' },
  { bg: 'bg_1', ghostSize: 45, ghostOpacity: 0.65, floor: '5F' },
  { bg: 'bg_2', ghostSize: 60, ghostOpacity: 0.75, floor: '7F' },
  { bg: 'bg_3', ghostSize: 75, ghostOpacity: 0.88, floor: '10F' },
  { bg: 'bg_4', ghostSize: 100, ghostOpacity: 1.0, floor: '12F' },
]

const SCENE_PLAYER_SCENES = ['SCENE_01', 'SCENE_02', 'SCENE_03', 'PHASE_2_ENTRY'] as const

interface Props {
  onRetry: () => void
}

export default function GameScene({ onRetry }: Props) {
  const { state, goTo, submitPhase1Gesture, submitPhase2Gesture, updateHandLost, startPhase2Signal, tickPhase2Signal, setReaction } = useGameState()
  const { scene, phase1 } = state
  const { play, stop } = useSoundManager()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const faceOffsetRef = useFaceTracking(videoRef)
  const [palmX, setPalmX] = useState<number | null>(null)
  const [isPointing, setIsPointing] = useState(false)
  const insightShownRef = useRef(false)
  const prevLossesRef = useRef(0)
  const [showInsight, setShowInsight] = useState(false)
  const [llmAnswer, setLlmAnswer] = useState<string | null>(null)
  const [revealDone, setRevealDone] = useState(false)

  // RPS 결과 오버레이
  const [rpsOverlay, setRpsOverlay] = useState<{
    playerGesture: Gesture
    result: 'win' | 'loss' | 'tie'
    phase: 'phase1' | 'phase2'
    pendingScene: () => void
  } | null>(null)

  // 손 안내 (첫 진입 시 한 번만)
  const handGuideShownRef = useRef(false)
  const [showHandGuide, setShowHandGuide] = useState(false)

  // 프레임 침입 (BAD_ENDING 직전)
  const [frameIntrude, setFrameIntrude] = useState(false)

  // 현재 귀신 질문 데이터
  const currentGhostQuestion: GhostQuestion | null =
    state.pendingQuestion != null
      ? getGhostQuestion(state.phase2.questionsAnswered - 1) ?? null
      : null

  // PHASE_1_RPS 첫 진입 시 손 안내 표시
  useEffect(() => {
    if (scene === 'PHASE_1_RPS' && !handGuideShownRef.current) {
      setShowHandGuide(true)
    }
  }, [scene])

  // PHASE_2_REACTION 자동 전환
  useEffect(() => {
    if (scene !== 'PHASE_2_REACTION') return
    const t = setTimeout(() => {
      setReaction(null)
      goTo('PHASE_2_RPS')
    }, 1500)
    return () => clearTimeout(t)
  }, [scene]) // eslint-disable-line

  useHandTracking({
    videoRef,
    onGesture: (g) => {
      if (rpsOverlay !== null) return  // overlay 표시 중 입력 무시
      if (scene === 'PHASE_1_RPS') {
        const result: 'tie' | 'loss' = g === 'paper' ? 'tie' : 'loss'
        setRpsOverlay({
          playerGesture: g,
          result,
          phase: 'phase1',
          pendingScene: () => submitPhase1Gesture(g),
        })
      }
      if (scene === 'PHASE_2_RPS') {
        const round = state.phase2.round
        const result = resolvePhase2(g, round, state.phase2.insightTriggered)
        setRpsOverlay({
          playerGesture: g,
          result,
          phase: 'phase2',
          pendingScene: () => {
            if (result === 'win') {
              submitPhase2Gesture(g, result)
            } else {
              const newLosses = state.phase2.losses + 1
              if (newLosses >= 3 || round >= 3) {
                setFrameIntrude(true)
                setTimeout(() => { setFrameIntrude(false); submitPhase2Gesture(g, result) }, 400)
              } else {
                submitPhase2Gesture(g, result)
              }
            }
          },
        })
      }
    },
    onHandLost: (s) => {
      setPalmX(null)
      updateHandLost(s)
      if (s === 0 && showHandGuide) {
        setShowHandGuide(false)
        handGuideShownRef.current = true
      }
    },
    onPointing: (p) => setIsPointing(p),
    onPalmX: (x) => setPalmX(x),
  })

  // Scene-based sound triggers
  useEffect(() => {
    if (scene === 'PHASE_1_RPS') play('elevator_loop')
    if (scene === 'PHASE_2_ENTRY') { stop('elevator_loop'); play('glitch') }
    if (scene === 'WIN_CUTSCENE') {
      play('mirror_bang')
      setTimeout(() => play('mirror_shatter'), 400)
      setTimeout(() => play('ghost_laugh'), 1200)
    }
    if (scene === 'BAD_ENDING') play('bad_drone')
    if (scene === 'DEAD_ENDING') play('dead_sting')
    if (scene === 'ESCAPE_HOLD') play('whisper')
    if (scene === 'TRUE_ENDING') play('whiteout')
    if (scene === 'JUMP_SCARE') play('jumpscare')
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 1 loss sound
  useEffect(() => {
    if (phase1.losses > prevLossesRef.current) {
      play('door_creak')
      prevLossesRef.current = phase1.losses
    }
  }, [phase1.losses]) // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 2 signal sound
  useEffect(() => {
    if (state.phase2SignalActive) play('ghost_signal')
  }, [state.phase2SignalActive]) // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 2 signal tick (rAF loop) — 오버레이 중 타이머 정지
  useEffect(() => {
    if (!state.phase2SignalActive) return
    if (rpsOverlay !== null) return
    let last = Date.now()
    let rafId: number
    const tick = () => {
      const now = Date.now()
      tickPhase2Signal(now - last)
      last = now
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [state.phase2SignalActive, tickPhase2Signal, rpsOverlay])

  // Trigger Phase 2 signal when entering PHASE_2_RPS
  useEffect(() => {
    if (scene === 'PHASE_2_RPS') startPhase2Signal()
  }, [scene]) // eslint-disable-line

  // Insight monologue logic
  useEffect(() => {
    if (
      scene === 'PHASE_2_RPS' &&
      state.phase2.round === 2 &&
      state.phase2.insightTriggered &&
      !insightShownRef.current
    ) {
      setShowInsight(true)
    }
  }, [scene, state.phase2.round, state.phase2.insightTriggered])

  const p1 = PHASE1_PARAMS[Math.min(phase1.losses, 4)]
  const isPhase2 = scene.startsWith('PHASE_2') || scene === 'WIN_CUTSCENE'
  const isGlitch = scene === 'PHASE_2_ENTRY'

  const handleSceneComplete = () => {
    if (scene === 'SCENE_01') goTo('SCENE_02')
    else if (scene === 'SCENE_02') goTo('SCENE_03')
    else if (scene === 'SCENE_03') goTo('PHASE_1_RPS')
    else if (scene === 'PHASE_2_ENTRY') goTo('PHASE_2_RPS')
  }

  if (scene === 'IDLE') {
    return (
      <div
        className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center cursor-pointer"
        onClick={() => goTo('SCENE_01')}
      >
        <CctvFilter />
        <p className="text-gray-500 font-mono text-sm z-50 relative">클릭하여 시작</p>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Hidden webcam video */}
      <video ref={videoRef} className="hidden" />

      {/* Layer 10: 배경 */}
      <Background
        image={isPhase2 ? 'bg_4' : p1.bg}
        brightness={isPhase2 ? 0.3 : 1}
        faceOffsetRef={faceOffsetRef}
      />

      {/* Layer 20: CCTV 필터 */}
      <CctvFilter />

      {/* Layer 30: 귀신 실루엣 */}
      {!isPhase2 && (
        <GhostSilhouette size={p1.ghostSize} opacity={p1.ghostOpacity} />
      )}
      {isPhase2 && (
        <GhostSilhouette
          size={100}
          opacity={1}
          position="right"
          approaching={scene === 'PHASE_2_RPS' && state.phase2SignalActive && rpsOverlay === null}
          frameIntrude={frameIntrude}
        />
      )}

      {/* Layer 40: 층수 표시 */}
      <FloorDisplay floor={p1.floor} glitch={isGlitch} />

      {/* Layer 50: 씬 텍스트 */}
      {(SCENE_PLAYER_SCENES as readonly string[]).includes(scene) && (
        <ScenePlayer sceneKey={scene} onComplete={handleSceneComplete} />
      )}

      {/* RPS 안내 */}
      {(scene === 'PHASE_1_RPS' || (scene === 'PHASE_2_RPS' && !showInsight)) && (
        <GestureOverlay
          active={true}
          handGuide={scene === 'PHASE_1_RPS' ? showHandGuide : undefined}
          countdownMs={scene === 'PHASE_2_RPS' && state.phase2SignalActive ? state.phase2SignalMs : undefined}
        />
      )}

      {/* PHASE_2_QUESTION: 귀신 질문 선택지 */}
      {scene === 'PHASE_2_QUESTION' && currentGhostQuestion && (
        <ChoiceInput
          question={currentGhostQuestion.question}
          choices={currentGhostQuestion.choices}
          onSelect={(reaction) => {
            setReaction(reaction)
            goTo('PHASE_2_REACTION')
          }}
        />
      )}

      {/* PHASE_2_REACTION: 선택 후 내면 독백 */}
      {scene === 'PHASE_2_REACTION' && state.pendingReaction && (
        <div className="absolute inset-0 z-50 flex items-end justify-center pb-16">
          <p className="font-mono text-gray-300 text-base tracking-wide italic">
            {state.pendingReaction}
          </p>
        </div>
      )}

      {/* Insight monologue */}
      {scene === 'PHASE_2_RPS' && showInsight && (
        <ScenePlayer
          sceneKey="INSIGHT"
          onComplete={() => {
            insightShownRef.current = true
            setShowInsight(false)
          }}
        />
      )}

      {/* Win Cutscene */}
      {scene === 'WIN_CUTSCENE' && (
        <WinCutscene onComplete={() => goTo('ESCAPE_FROST')} />
      )}

      {/* Bad Ending */}
      {scene === 'BAD_ENDING' && (
        <BadEndingCutscene onComplete={() => goTo('ENDING_SCREEN_BAD')} />
      )}

      {/* Dead Ending (Phase 2 timer expires) */}
      {scene === 'DEAD_ENDING' && (
        <DeadEndingCutscene onComplete={() => goTo('ENDING_SCREEN_DEAD')} />
      )}

      {/* Jump Scare (hand lost 5+ seconds) */}
      {scene === 'JUMP_SCARE' && (
        <JumpScareCutscene onComplete={() => goTo('ENDING_SCREEN_JUMP')} />
      )}

      {/* Ending Screens */}
      {scene === 'ENDING_SCREEN_BAD' && (
        <EndingScreen endingType="bad" onRetry={onRetry} />
      )}
      {scene === 'ENDING_SCREEN_DEAD' && (
        <EndingScreen endingType="dead" onRetry={onRetry} />
      )}
      {scene === 'ENDING_SCREEN_JUMP' && (
        <EndingScreen endingType="jump" onRetry={onRetry} />
      )}

      {/* ESCAPE_FROST: frost wipe interaction */}
      {scene === 'ESCAPE_FROST' && (
        <>
          <ScenePlayer sceneKey="ESCAPE_FROST" onComplete={() => {}} />
          <FrostWipe palmX={palmX} onComplete={() => goTo('ESCAPE_HOLD')} />
        </>
      )}

      {/* ESCAPE_HOLD: index finger 3s hold */}
      {scene === 'ESCAPE_HOLD' && (
        <>
          <ScenePlayer sceneKey="ESCAPE_HOLD" onComplete={() => {}} />
          <HoldButton
            isPointing={isPointing}
            onComplete={() => goTo('TRUE_ENDING')}
            onFail={() => goTo('BAD_ENDING')}
          />
        </>
      )}

      {/* TRUE_ENDING: question + LLM answer */}
      {scene === 'TRUE_ENDING' && !llmAnswer && (
        <>
          <ScenePlayer sceneKey="SCENE_10" onComplete={() => {}} />
          <QuestionInput onAnswer={a => setLlmAnswer(a)} />
        </>
      )}
      {scene === 'TRUE_ENDING' && llmAnswer && !revealDone && (
        <TextBox
          line={{ type: 'reveal', text: llmAnswer }}
          onComplete={() => setRevealDone(true)}
        />
      )}
      {scene === 'TRUE_ENDING' && llmAnswer && revealDone && (
        <ScenePlayer sceneKey="TRUE_ENDING" onComplete={() => {}} />
      )}

      {/* RPS 결과 오버레이 */}
      {rpsOverlay && (
        <RpsResultOverlay
          playerGesture={rpsOverlay.playerGesture}
          result={rpsOverlay.result}
          phase={rpsOverlay.phase}
          onDone={() => {
            const action = rpsOverlay.pendingScene
            setRpsOverlay(null)
            action()
          }}
        />
      )}
    </div>
  )
}
