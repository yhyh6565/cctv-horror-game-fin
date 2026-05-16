import { useRef, useState, useEffect } from 'react'
import { useGameState } from '../../hooks/useGameState'
import { useHandTracking } from '../../hooks/useHandTracking'
import type { Gesture } from '../../types/game'
import Background from './Background'
import GhostSilhouette from './GhostSilhouette'
import CctvFilter from './CctvFilter'
import ScenePlayer from './ScenePlayer'
import WinCutscene from './WinCutscene'
import BadEndingCutscene from './BadEndingCutscene'
import FloorDisplay from '../ui/FloorDisplay'
import GestureOverlay from '../ui/GestureOverlay'


const PHASE1_PARAMS = [
  { bg: 'bg_0', ghostSize: 0, ghostOpacity: 0, floor: '1F' },
  { bg: 'bg_1', ghostSize: 45, ghostOpacity: 0.65, floor: '5F' },
  { bg: 'bg_2', ghostSize: 60, ghostOpacity: 0.75, floor: '7F' },
  { bg: 'bg_3', ghostSize: 75, ghostOpacity: 0.88, floor: '10F' },
  { bg: 'bg_4', ghostSize: 100, ghostOpacity: 1.0, floor: '12F' },
]

export default function GameScene() {
  const { state, goTo, submitPhase1Gesture, submitPhase2Gesture, updateHandLost, startPhase2Signal, tickPhase2Signal } = useGameState()
  const { scene, phase1 } = state

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [currentGesture] = useState<Gesture>('none')
  const [holdProgress, setHoldProgress] = useState(0)
  const holdStartRef = useRef<number | null>(null)
  const [palmX, setPalmX] = useState<number | null>(null)
  const [isPointing, setIsPointing] = useState(false)
  const insightShownRef = useRef(false)
  const [showInsight, setShowInsight] = useState(false)

  // Track hold progress for UI display
  useEffect(() => {
    if (currentGesture === 'none') {
      setHoldProgress(0)
      holdStartRef.current = null
      return
    }
    holdStartRef.current = Date.now()
    const interval = setInterval(() => {
      if (holdStartRef.current) {
        const held = Date.now() - holdStartRef.current
        setHoldProgress(Math.min(held / 800, 1))
      }
    }, 50)
    return () => clearInterval(interval)
  }, [currentGesture])

  useHandTracking({
    videoRef,
    onGesture: (g) => {
      if (scene === 'PHASE_1_RPS') submitPhase1Gesture(g)
      if (scene === 'PHASE_2_RPS') submitPhase2Gesture(g)
    },
    onHandLost: updateHandLost,
    onPointing: (p) => setIsPointing(p),
    onPalmX: (x) => setPalmX(x),
  })

  // Phase 2 signal tick (rAF loop)
  useEffect(() => {
    if (!state.phase2SignalActive) return
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
  }, [state.phase2SignalActive, tickPhase2Signal])

  // Trigger Phase 2 signal when entering PHASE_2_RPS
  useEffect(() => {
    if (scene === 'PHASE_2_RPS') startPhase2Signal()
  }, [scene]) // eslint-disable-line

  // Insight monologue logic (show when round=2, insightTriggered=true, not yet shown)
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
    else if (scene === 'PHASE_2_QUESTION') goTo('PHASE_2_RPS')
    else if (scene === 'WIN_CUTSCENE') goTo('ESCAPE_FROST')
  }

  // suppress unused var warnings for palmX and isPointing (used by hand tracking callbacks)
  void palmX
  void isPointing

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
      />

      {/* Layer 20: CCTV 필터 */}
      <CctvFilter />

      {/* Layer 30: 귀신 실루엣 */}
      {!isPhase2 && (
        <GhostSilhouette size={p1.ghostSize} opacity={p1.ghostOpacity} />
      )}
      {isPhase2 && (
        <GhostSilhouette size={100} opacity={1} position="right" />
      )}

      {/* Layer 40: 층수 표시 */}
      <FloorDisplay floor={p1.floor} glitch={isGlitch} />

      {/* Layer 50: 텍스트 */}
      {['SCENE_01', 'SCENE_02', 'SCENE_03', 'PHASE_2_ENTRY'].includes(scene) && (
        <ScenePlayer sceneKey={scene} onComplete={handleSceneComplete} />
      )}

      {/* Phase 1 RPS: GestureOverlay */}
      {scene === 'PHASE_1_RPS' && (
        <GestureOverlay
          active={true}
          holdProgress={holdProgress}
          currentGesture={currentGesture}
        />
      )}

      {/* PHASE_2_QUESTION: ghost question display */}
      {scene === 'PHASE_2_QUESTION' && state.pendingQuestion && (
        <div className="absolute bottom-0 left-0 right-0 z-50 p-4">
          <div className="bg-black/80 border border-red-900 rounded p-4">
            <p className="text-red-400 font-mono text-sm">{state.pendingQuestion}</p>
          </div>
          <button
            onClick={() => goTo('PHASE_2_RPS')}
            className="mt-2 w-full text-gray-500 text-xs py-2"
          >
            계속 →
          </button>
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

      {/* Phase 2 RPS: GestureOverlay with countdown */}
      {scene === 'PHASE_2_RPS' && !showInsight && (
        <GestureOverlay
          active={true}
          holdProgress={holdProgress}
          currentGesture={currentGesture}
          countdownMs={state.phase2SignalActive ? state.phase2SignalMs : undefined}
        />
      )}

      {/* Win Cutscene */}
      {scene === 'WIN_CUTSCENE' && (
        <WinCutscene onComplete={() => goTo('ESCAPE_FROST')} />
      )}

      {/* Bad Ending */}
      {scene === 'BAD_ENDING' && (
        <BadEndingCutscene onComplete={() => {}} />
      )}
    </div>
  )
}
