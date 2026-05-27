# 버그픽스 + EndingScreen 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 소프트락 3종 해소(엔딩 후 탐사기록 트랜스크립트 + 재시작), 타이머 버그 2종 + HoldButton 콜백 중복 수정, Phase 2 가위 힌트 및 UX 개선 3종 구현.

**Architecture:** 수술적 패치(Surgical Patch) 방식. 기존 상태 머신 구조를 유지하면서 누락된 연결(onComplete no-op)을 채우고, 타이머 상태 초기화 누락을 수정한다. 신규 EndingScreen 컴포넌트가 세 엔딩의 공통 트랜스크립트 + 재시작 흐름을 담당한다. App 레벨에서 `gameKey`로 GameScene을 강제 리마운트해 전체 상태를 초기화한다.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Vitest

**Working directory:** `/Users/yeonhee/Desktop/Archive/mirror-vn`

---

## 파일 구조

### 신규 생성
- `src/components/scene/EndingScreen.tsx` — 탐사기록 트랜스크립트 + 재시작 버튼

### 수정
- `src/types/game.ts` — SceneId에 ENDING_SCREEN_* 3종 추가
- `src/App.tsx` — gameKey state, Game에 onRetry 전달
- `src/pages/Game.tsx` — onRetry prop 받아 GameScene에 전달
- `src/components/scene/GameScene.tsx` — 엔딩 연결, race condition guard, inputLocked, ReactionBar
- `src/components/scene/DeadEndingCutscene.tsx` — onComplete prop + 3초 타이머 추가
- `src/components/scene/JumpScareCutscene.tsx` — onComplete을 GameScene에서 주입받도록 확인
- `src/hooks/useGameState.ts` — PHASE_2_QUESTION 전환 시 timer 정지
- `src/components/interaction/HoldButton.tsx` — useEffect → rAF 루프 교체
- `src/components/ui/GestureOverlay.tsx` — phase2Mode prop + 가위 힌트 추가

---

## Task 1: SceneId 타입 + App/Game 재시작 스캐폴딩

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/App.tsx`
- Modify: `src/pages/Game.tsx`

- [ ] **Step 1: SceneId에 엔딩 씬 3종 추가**

`src/types/game.ts` 의 `SceneId` 타입을 다음으로 교체:

```ts
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
```

- [ ] **Step 2: App.tsx에 gameKey + onRetry 추가**

`src/App.tsx` 전체를 교체:

```tsx
import { useState } from 'react'
import Game from './pages/Game'

export default function App() {
  const [gameKey, setGameKey] = useState(0)
  return <Game key={gameKey} onRetry={() => setGameKey(k => k + 1)} />
}
```

- [ ] **Step 3: Game.tsx에 onRetry prop 추가**

`src/pages/Game.tsx` 전체를 교체:

```tsx
import GameScene from '../components/scene/GameScene'

interface Props {
  onRetry: () => void
}

export default function Game({ onRetry }: Props) {
  return <GameScene onRetry={onRetry} />
}
```

- [ ] **Step 4: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```

Expected: GameScene.tsx에서 onRetry prop 미사용 에러 발생 (다음 태스크에서 처리). 그 외 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/types/game.ts src/App.tsx src/pages/Game.tsx
git commit -m "feat: add ENDING_SCREEN scene types and retry scaffolding"
```

---

## Task 2: EndingScreen 컴포넌트 신규 생성

**Files:**
- Create: `src/components/scene/EndingScreen.tsx`

- [ ] **Step 1: EndingScreen 컴포넌트 작성**

`src/components/scene/EndingScreen.tsx` 생성:

```tsx
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
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/components/scene/EndingScreen.tsx
git commit -m "feat: add EndingScreen with transcript typewriter and retry"
```

---

## Task 3: DeadEndingCutscene onComplete 추가

**Files:**
- Modify: `src/components/scene/DeadEndingCutscene.tsx`

현재 `DeadEndingCutscene`은 props가 없고 타이머도 없어 화면이 영구히 멈춤.

- [ ] **Step 1: onComplete prop + 3초 타이머 추가**

`src/components/scene/DeadEndingCutscene.tsx` 전체를 교체:

```tsx
import { useEffect } from 'react'

interface Props {
  onComplete: () => void
}

export default function DeadEndingCutscene({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, 3000)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
      <p className="text-red-600 font-mono text-xl animate-pulse text-center">
        거짓 대답을 한 경우 :<br />따로 번호 안내는 없다.<br />명복을 빈다.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```

Expected: GameScene.tsx에서 `<DeadEndingCutscene />` prop 누락 에러 발생 (Task 4에서 처리). 그 외 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/components/scene/DeadEndingCutscene.tsx
git commit -m "fix: add onComplete prop and 3s timer to DeadEndingCutscene"
```

---

## Task 4: GameScene — 엔딩 씬 연결 + onRetry prop

**Files:**
- Modify: `src/components/scene/GameScene.tsx`

- [ ] **Step 1: GameScene에 onRetry prop 추가**

`src/components/scene/GameScene.tsx` 상단 import 블록 아래에 EndingScreen import 추가:

```tsx
import EndingScreen from './EndingScreen'
```

함수 시그니처를 다음으로 변경:

```tsx
interface Props {
  onRetry: () => void
}

export default function GameScene({ onRetry }: Props) {
```

- [ ] **Step 2: 엔딩 연결 교체**

기존 BAD_ENDING / DEAD_ENDING / JUMP_SCARE 블록:
```tsx
{scene === 'BAD_ENDING' && (
  <BadEndingCutscene onComplete={() => {}} />
)}
{scene === 'DEAD_ENDING' && <DeadEndingCutscene />}
{scene === 'JUMP_SCARE' && <JumpScareCutscene />}
```

다음으로 교체:
```tsx
{scene === 'BAD_ENDING' && (
  <BadEndingCutscene onComplete={() => goTo('ENDING_SCREEN_BAD')} />
)}
{scene === 'DEAD_ENDING' && (
  <DeadEndingCutscene onComplete={() => goTo('ENDING_SCREEN_DEAD')} />
)}
{scene === 'JUMP_SCARE' && (
  <JumpScareCutscene onComplete={() => goTo('ENDING_SCREEN_JUMP')} />
)}
{scene === 'ENDING_SCREEN_BAD' && (
  <EndingScreen endingType="bad" onRetry={onRetry} />
)}
{scene === 'ENDING_SCREEN_DEAD' && (
  <EndingScreen endingType="dead" onRetry={onRetry} />
)}
{scene === 'ENDING_SCREEN_JUMP' && (
  <EndingScreen endingType="jump" onRetry={onRetry} />
)}
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```

Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add src/components/scene/GameScene.tsx
git commit -m "fix: wire all endings to EndingScreen, add onRetry"
```

---

## Task 5: Fix 1 — PHASE_2_QUESTION 진입 시 타이머 정지

**Files:**
- Modify: `src/hooks/useGameState.ts`
- Modify: `src/hooks/useGameState.test.ts`

- [ ] **Step 1: 테스트 먼저 작성**

`src/hooks/useGameState.test.ts` 에 다음 테스트 블록 추가:

```ts
import { renderHook, act } from '@testing-library/react'
import { useGameState } from './useGameState'

describe('Phase 2 timer stops on question', () => {
  it('phase2SignalActive is false after submitPhase2Gesture loss', () => {
    const { result } = renderHook(() => useGameState())

    // Phase 2로 세팅
    act(() => { result.current.goTo('PHASE_2_RPS') })
    act(() => { result.current.startPhase2Signal() })

    expect(result.current.state.phase2SignalActive).toBe(true)

    // 패배 처리 (rock = loss)
    act(() => { result.current.submitPhase2Gesture('rock', 'loss') })

    // PHASE_2_QUESTION으로 전환 후 타이머 꺼져야 함
    expect(result.current.state.scene).toBe('PHASE_2_QUESTION')
    expect(result.current.state.phase2SignalActive).toBe(false)
    expect(result.current.state.phase2SignalMs).toBe(0)
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx vitest run src/hooks/useGameState.test.ts 2>&1
```

Expected: `phase2SignalActive is false after submitPhase2Gesture loss` FAIL.

- [ ] **Step 3: useGameState.ts 수정**

`src/hooks/useGameState.ts` 의 `submitPhase2Gesture` 안에서 loss 분기의 return 블록에 `phase2SignalActive: false, phase2SignalMs: 0` 추가:

```ts
// 기존 (loss 분기, BAD_ENDING이 아닌 경우)
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
}

// 변경
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
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx vitest run src/hooks/useGameState.test.ts 2>&1
```

Expected: 모든 테스트 PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/hooks/useGameState.ts src/hooks/useGameState.test.ts
git commit -m "fix: stop phase2 timer when transitioning to PHASE_2_QUESTION"
```

---

## Task 6: Fix 2 — 타임아웃 경계 레이스컨디션 guard

**Files:**
- Modify: `src/components/scene/GameScene.tsx`

- [ ] **Step 1: onGesture 핸들러에 guard 추가**

`GameScene.tsx` 의 `useHandTracking` 콜백 안 `onGesture`:

```ts
// 기존
onGesture: (g) => {
  if (rpsOverlay !== null) return
  if (scene === 'PHASE_1_RPS') {
```

다음으로 교체:
```ts
onGesture: (g) => {
  if (rpsOverlay !== null) return
  if (scene === 'PHASE_2_RPS' && !state.phase2SignalActive) return
  if (scene === 'PHASE_1_RPS') {
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/components/scene/GameScene.tsx
git commit -m "fix: guard phase2 gesture handler against timeout race condition"
```

---

## Task 7: Fix 3 — HoldButton rAF 교체

**Files:**
- Modify: `src/components/interaction/HoldButton.tsx`

- [ ] **Step 1: HoldButton 전체 교체**

`src/components/interaction/HoldButton.tsx` 전체를 다음으로 교체:

```tsx
import { useEffect, useRef, useState } from 'react'

interface Props {
  isPointing: boolean
  holdDurationMs?: number
  onComplete: () => void
  onFail: () => void
}

export default function HoldButton({ isPointing, holdDurationMs = 3000, onComplete, onFail }: Props) {
  const [progress, setProgress] = useState(0)
  const startRef = useRef<number | null>(null)
  const completedRef = useRef(false)
  const failedRef = useRef(false)

  useEffect(() => {
    if (completedRef.current || failedRef.current) return

    if (!isPointing) {
      if (startRef.current !== null) {
        failedRef.current = true
        startRef.current = null
        setProgress(0)
        onFail()
      }
      return
    }

    // isPointing === true: rAF 루프 시작
    if (!startRef.current) startRef.current = Date.now()

    let rafId: number
    const tick = () => {
      if (!startRef.current || completedRef.current || failedRef.current) return
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(elapsed / holdDurationMs, 1)
      setProgress(pct)
      if (pct >= 1) {
        completedRef.current = true
        onComplete()
        return
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isPointing, holdDurationMs, onComplete, onFail])

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      <div className="text-white text-sm">☝ 검지를 들고 유지하세요</div>
      <div className="w-48 h-3 bg-gray-700 rounded overflow-hidden">
        <div
          className="h-full bg-green-400 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="text-gray-400 text-xs">{Math.round(progress * 3)}s / 3s</div>
    </div>
  )
}
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/components/interaction/HoldButton.tsx
git commit -m "fix: replace HoldButton useEffect with rAF loop to prevent multi-fire"
```

---

## Task 8: UX — Phase 2 가위 힌트 + 오버레이 묵살 피드백 + ReactionBar

**Files:**
- Modify: `src/components/ui/GestureOverlay.tsx`
- Modify: `src/components/scene/GameScene.tsx`

### 8-1. GestureOverlay phase2Mode 추가

- [ ] **Step 1: GestureOverlay에 phase2Mode prop 추가**

`src/components/ui/GestureOverlay.tsx` 전체를 교체:

```tsx
interface Props {
  active: boolean
  countdownMs?: number
  handGuide?: boolean
  phase2Mode?: boolean
}

export default function GestureOverlay({ active, countdownMs, handGuide, phase2Mode }: Props) {
  if (!active) return null
  const secs = countdownMs != null ? (countdownMs / 1000).toFixed(1) : null

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
      {handGuide && (
        <p className="text-gray-400 font-mono text-xs text-center mb-2 animate-pulse">
          카메라에 손을 보여주세요
        </p>
      )}
      {phase2Mode && (
        <p className="text-red-400 font-mono text-xs text-center animate-pulse">
          ✌ 가위만 이긴다
        </p>
      )}
      {secs != null && (
        <div className="text-red-400 font-mono text-2xl">{secs}s</div>
      )}
    </div>
  )
}
```

### 8-2. GameScene — phase2Mode 전달 + inputLocked + ReactionBar

- [ ] **Step 2: GameScene에 변경사항 3종 적용**

**2a. GestureOverlay에 phase2Mode 전달**

기존:
```tsx
<GestureOverlay
  active={true}
  handGuide={scene === 'PHASE_1_RPS' ? showHandGuide : undefined}
  countdownMs={scene === 'PHASE_2_RPS' && state.phase2SignalActive ? state.phase2SignalMs : undefined}
/>
```

변경:
```tsx
<GestureOverlay
  active={true}
  phase2Mode={scene === 'PHASE_2_RPS'}
  handGuide={scene === 'PHASE_1_RPS' ? showHandGuide : undefined}
  countdownMs={scene === 'PHASE_2_RPS' && state.phase2SignalActive ? state.phase2SignalMs : undefined}
/>
```

**2b. inputLocked state 추가** (기존 useState 목록 아래에 추가):
```tsx
const [inputLocked, setInputLocked] = useState(false)
```

**2c. onGesture 핸들러에 inputLocked 피드백 추가**

기존:
```ts
if (rpsOverlay !== null) return
```

변경:
```ts
if (rpsOverlay !== null) {
  setInputLocked(true)
  setTimeout(() => setInputLocked(false), 400)
  return
}
```

**2d. inputLocked 아이콘 JSX 추가** (RpsResultOverlay 렌더링 블록 바로 위에):
```tsx
{inputLocked && (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60]
                  text-white text-2xl opacity-60 pointer-events-none select-none">
    ⏳
  </div>
)}
```

**2e. PHASE_2_REACTION 독백에 ReactionBar 추가**

먼저 파일 상단(다른 import들 아래)에 인라인 컴포넌트 추가:
```tsx
function ReactionBar() {
  const [width, setWidth] = useState(100)
  useEffect(() => {
    requestAnimationFrame(() => setWidth(0))
  }, [])
  return (
    <div className="w-full h-0.5 bg-gray-800">
      <div
        className="h-full bg-gray-600"
        style={{ width: `${width}%`, transition: 'width 1.5s linear' }}
      />
    </div>
  )
}
```

기존 PHASE_2_REACTION 블록:
```tsx
{scene === 'PHASE_2_REACTION' && state.pendingReaction && (
  <div className="absolute inset-0 z-50 flex items-end justify-center pb-16">
    <p className="font-mono text-gray-300 text-base tracking-wide italic">
      {state.pendingReaction}
    </p>
  </div>
)}
```

변경:
```tsx
{scene === 'PHASE_2_REACTION' && state.pendingReaction && (
  <div className="absolute inset-0 z-50 flex flex-col items-end justify-end pb-16 px-8 gap-3">
    <p className="font-mono text-gray-300 text-base tracking-wide italic self-center">
      {state.pendingReaction}
    </p>
    <ReactionBar />
  </div>
)}
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```

Expected: 에러 없음.

- [ ] **Step 4: 전체 테스트 실행**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx vitest run 2>&1
```

Expected: 모든 테스트 PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/components/ui/GestureOverlay.tsx src/components/scene/GameScene.tsx
git commit -m "feat: add phase2 scissors hint, input locked feedback, reaction progress bar"
```

---

## 자체검토 (Spec Coverage)

| 스펙 항목 | 구현 태스크 |
|-----------|------------|
| EndingScreen 신규 컴포넌트 | Task 2 |
| BAD/DEAD/JUMP 엔딩 트랜스크립트 | Task 2 (TRANSCRIPTS 객체) |
| 꿈결 수집기 애니메이션 흐름 | Task 2 (phase state machine) |
| 재시작 gameKey 리마운트 | Task 1 (App.tsx) |
| SceneId ENDING_SCREEN_* 추가 | Task 1 (types/game.ts) |
| DeadEndingCutscene onComplete | Task 3 |
| JumpScareCutscene onComplete | Task 4 (GameScene 연결, 기존 컴포넌트에 이미 onComplete 있음) |
| 엔딩 → EndingScreen 연결 | Task 4 |
| Fix 1 타이머 정지 | Task 5 |
| Fix 2 레이스컨디션 guard | Task 6 |
| Fix 3 HoldButton rAF | Task 7 |
| Phase 2 가위 힌트 | Task 8 |
| 오버레이 묵살 피드백 | Task 8 |
| REACTION 자동전환 표시 | Task 8 |
