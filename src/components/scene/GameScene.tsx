import { useGameState } from '../../hooks/useGameState'
import Background from './Background'
import GhostSilhouette from './GhostSilhouette'
import CctvFilter from './CctvFilter'
import ScenePlayer from './ScenePlayer'
import FloorDisplay from '../ui/FloorDisplay'

// Phase 1 losses → 배경/귀신 파라미터 매핑
const PHASE1_PARAMS = [
  { bg: 'bg_0', ghostSize: 0, ghostOpacity: 0, floor: '1F' },
  { bg: 'bg_1', ghostSize: 45, ghostOpacity: 0.65, floor: '5F' },
  { bg: 'bg_2', ghostSize: 60, ghostOpacity: 0.75, floor: '7F' },
  { bg: 'bg_3', ghostSize: 75, ghostOpacity: 0.88, floor: '10F' },
  { bg: 'bg_4', ghostSize: 100, ghostOpacity: 1.0, floor: '12F' },
]

export default function GameScene() {
  const { state, goTo } = useGameState()
  const { scene, phase1 } = state

  // Auto-start from IDLE
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

  const p1 = PHASE1_PARAMS[Math.min(phase1.losses, 4)]
  const isPhase2 = scene.startsWith('PHASE_2') || scene === 'WIN_CUTSCENE'
  const isGlitch = scene === 'PHASE_2_ENTRY'

  const handleSceneComplete = () => {
    if (scene === 'SCENE_01') goTo('SCENE_02')
    else if (scene === 'SCENE_02') goTo('SCENE_03')
    else if (scene === 'SCENE_03') goTo('PHASE_1_RPS')
    else if (scene === 'PHASE_2_ENTRY') goTo('PHASE_2_RPS')
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
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

      {/* Layer 50: 텍스트 + UI */}
      {['SCENE_01', 'SCENE_02', 'SCENE_03', 'PHASE_2_ENTRY'].includes(scene) && (
        <ScenePlayer sceneKey={scene} onComplete={handleSceneComplete} />
      )}
    </div>
  )
}
