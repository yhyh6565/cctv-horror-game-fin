# UX 개선 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** RPS 루프 명확화, 귀신 질문 선택지화, horror 비주얼 강화로 게임 경험을 원작에 충실하게 개선한다.

**Architecture:** 6개의 독립적 태스크로 구성. 각 태스크는 신규 컴포넌트 생성 또는 기존 컴포넌트 수정이며 서로 의존성이 낮아 순차 실행 가능. GameScene.tsx가 모든 새 컴포넌트를 연결하는 최종 통합 태스크(Task 6)에서 처리된다.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Vitest

**Working directory:** `/Users/yeonhee/Desktop/Archive/mirror-vn`

---

## 파일 구조

### 신규 생성
- `src/data/ghostQuestions.ts` — 귀신 질문 + 선택지 데이터 (GHOST_QUESTIONS 이동)
- `src/components/interaction/ChoiceInput.tsx` — 선택지 UI 컴포넌트
- `src/components/scene/RpsResultOverlay.tsx` — RPS 결과 오버레이

### 수정
- `src/types/game.ts` — `pendingReaction: string | null` 추가
- `src/hooks/useGameState.ts` — ghostQuestions.ts import, pendingReaction 상태 처리
- `src/components/scene/GhostSilhouette.tsx` — `approaching` prop + frame intrusion prop 추가
- `src/components/ui/FloorDisplay.tsx` — 닉시튜브 스타일
- `src/components/scene/GameScene.tsx` — 모든 새 컴포넌트 연결, 손 안내 로직, RPS 결과 흐름

---

## Task 1: 데이터 분리 + 타입 업데이트

**Files:**
- Create: `src/data/ghostQuestions.ts`
- Modify: `src/types/game.ts`
- Modify: `src/hooks/useGameState.ts`

- [ ] **Step 1: ghostQuestions.ts 작성**

```typescript
// src/data/ghostQuestions.ts

export interface GhostChoice {
  text: string
  reaction: string
}

export interface GhostQuestion {
  question: string
  choices: GhostChoice[]
}

export const GHOST_QUESTIONS: GhostQuestion[] = [
  {
    question: '이름이 뭐야?',
    choices: [
      { text: '이름을 적는다', reaction: '손이 떨렸다.' },
      { text: '거짓말을 하려다 멈췄다', reaction: '위험하다. 거짓말은 안 된다.' },
      { text: '침묵한다', reaction: '하지만 침묵도 답이 아닐 것 같았다.' },
    ],
  },
  {
    question: '생일이 언제야?',
    choices: [
      { text: '생일을 적는다', reaction: '귀신이 팔짝팔짝 뛰었다.' },
      { text: '다른 날짜를 적으려 했다', reaction: '…안 된다. 거짓말은 위험해.' },
      { text: '왜 알고 싶어?', reaction: '대답하지 않으면 안 될 것 같았다.' },
    ],
  },
  {
    question: '지금 무서워?',
    choices: [
      { text: '응', reaction: '솔직하게 대답했다.' },
      { text: '아니', reaction: '거짓말이었다.' },
      { text: '너한텐 안 져', reaction: '이제 어떻게 해야 할지 알았다.' },
    ],
  },
]

export function getGhostQuestion(index: number): GhostQuestion | null {
  return GHOST_QUESTIONS[index] ?? null
}
```

- [ ] **Step 2: types/game.ts에 pendingReaction 추가**

`src/types/game.ts` 의 `GameState` 인터페이스에 한 줄 추가:

```typescript
export interface GameState {
  scene: SceneId
  phase1: Phase1State
  phase2: Phase2State
  handLostSeconds: number
  pendingQuestion: string | null
  pendingReaction: string | null   // ← 추가: 선택지 선택 후 독백 텍스트
  phase2SignalActive: boolean
  phase2SignalMs: number
}
```

- [ ] **Step 3: useGameState.ts 업데이트**

`src/hooks/useGameState.ts` 에서:

3a. import 변경:
```typescript
// 기존
const GHOST_QUESTIONS = ['이름이 뭐야?', '생일이 언제야?', '지금 무서워?']
export function getGhostQuestion(index: number): string {
  return GHOST_QUESTIONS[index] ?? ''
}
```
위 두 줄을 삭제하고, 파일 상단에 추가:
```typescript
import { getGhostQuestion } from '../data/ghostQuestions'
export { getGhostQuestion }  // 기존 사용처를 위한 re-export (하위 호환)
```

3b. INITIAL_STATE에 `pendingReaction: null` 추가:
```typescript
const INITIAL_STATE: GameState = {
  scene: 'IDLE',
  phase1: { round: 1, losses: 0 },
  phase2: { round: 1, losses: 0, questionsAnswered: 0, insightTriggered: false },
  handLostSeconds: 0,
  pendingQuestion: null,
  pendingReaction: null,   // ← 추가
  phase2SignalActive: false,
  phase2SignalMs: 0,
}
```

3c. `submitPhase2Gesture` 내 PHASE_2_QUESTION 전환 시 `pendingQuestion` 설정 부분에서
기존: `pendingQuestion: getGhostQuestion(questionsAnswered),`
변경: `pendingQuestion: getGhostQuestion(questionsAnswered)?.question ?? null,`

3d. `setReaction` 콜백 추가 (return 목록에 포함):
```typescript
const setReaction = useCallback((reaction: string | null) => {
  advance({ pendingReaction: reaction })
}, [advance])
```

return에 `setReaction` 추가:
```typescript
return { state, goTo, submitPhase1Gesture, submitPhase2Gesture, updateHandLost, isDeadEndingRoll, startPhase2Signal, tickPhase2Signal, setReaction }
```

- [ ] **Step 4: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```
Expected: 에러 없음 (exit 0)

- [ ] **Step 5: 커밋**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && git add src/data/ghostQuestions.ts src/types/game.ts src/hooks/useGameState.ts && git commit -m "feat: extract ghost questions data, add pendingReaction state"
```

---

## Task 2: ChoiceInput 컴포넌트

**Files:**
- Create: `src/components/interaction/ChoiceInput.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```typescript
// src/components/interaction/ChoiceInput.tsx

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
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && git add src/components/interaction/ChoiceInput.tsx && git commit -m "feat: add ChoiceInput component with horror styling"
```

---

## Task 3: RpsResultOverlay 컴포넌트

**Files:**
- Create: `src/components/scene/RpsResultOverlay.tsx`

### 배경 지식
귀신 패 계산 규칙:
- Phase 1: paper→paper(tie), rock→paper(loss), scissors→rock(loss)
- Phase 2 win: scissors→paper
- Phase 2 loss: scissors→rock, rock→paper, paper→'???'

- [ ] **Step 1: 컴포넌트 작성**

```typescript
// src/components/scene/RpsResultOverlay.tsx

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
    if (playerGesture === 'rock') return '보'
    if (playerGesture === 'scissors') return '바위'
    return '?'
  }
  // phase2
  if (result === 'win') return '보'
  if (playerGesture === 'scissors') return '바위'
  if (playerGesture === 'rock') return '보'
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
```

- [ ] **Step 2: Google Font 추가**

`index.html` 의 `<head>` 에 추가:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet">
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```
Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && git add src/components/scene/RpsResultOverlay.tsx index.html && git commit -m "feat: add RpsResultOverlay with held-breath timing and ghost move reveal"
```

---

## Task 4: GhostSilhouette 업데이트

**Files:**
- Modify: `src/components/scene/GhostSilhouette.tsx`

두 가지 추가:
1. `approaching` prop → Phase 2 타이머 중 앞으로 기울어지는 CSS 애니메이션
2. `frameIntrude` prop → BAD_ENDING 직전 화면 가득 채우기

- [ ] **Step 1: 컴포넌트 전체 교체**

```typescript
// src/components/scene/GhostSilhouette.tsx

interface Props {
  size: number         // 0-100 (% of screen height)
  opacity: number      // 0-1
  position?: 'center' | 'right'
  descending?: boolean
  approaching?: boolean   // Phase 2 타이머 중 앞으로 기울어짐
  frameIntrude?: boolean  // BAD_ENDING 직전 화면 가득 채우기
}

export default function GhostSilhouette({
  size,
  opacity,
  position = 'center',
  descending = false,
  approaching = false,
  frameIntrude = false,
}: Props) {
  if (opacity === 0) return null

  const baseTransform = position === 'center' ? 'translateX(-50%)' : 'none'

  return (
    <div
      className="absolute z-30"
      style={{
        bottom: descending ? '-20%' : '0',
        left: position === 'right' ? 'auto' : '50%',
        right: position === 'right' ? '0' : 'auto',
        transform: baseTransform,
        opacity: frameIntrude ? 1 : opacity,
        transition: frameIntrude
          ? 'all 0.4s ease-in'
          : 'all 0.8s ease-in-out',
        zIndex: frameIntrude ? 60 : 30,
      }}
    >
      <img
        src="/images/ghost_silhouette.png"
        alt=""
        style={{
          height: frameIntrude ? '250vh' : `${size}vh`,
          filter: 'brightness(0) blur(2px)',
          // Phase 2 타이머 중 천천히 앞으로 기울어짐
          animation: approaching && !frameIntrude
            ? 'ghostApproach 1500ms ease-in forwards'
            : 'none',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: ghostApproach keyframe을 index.css 또는 App.css에 추가**

`src/index.css` (또는 메인 CSS 파일) 에 추가:
```css
@keyframes ghostApproach {
  from {
    transform: scale(1.0) translateY(0);
  }
  to {
    transform: scale(1.04) translateY(-8px);
  }
}
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```
Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && git add src/components/scene/GhostSilhouette.tsx src/index.css && git commit -m "feat: add approaching animation and frameIntrude to GhostSilhouette"
```

---

## Task 5: FloorDisplay 닉시튜브 스타일

**Files:**
- Modify: `src/components/ui/FloorDisplay.tsx`

- [ ] **Step 1: 컴포넌트 전체 교체**

```typescript
// src/components/ui/FloorDisplay.tsx

interface Props {
  floor: string   // '1F' ~ '12F' or '1930819F'
  glitch?: boolean
}

export default function FloorDisplay({ floor, glitch = false }: Props) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
      <div
        className="px-3 py-1"
        style={{ background: 'rgba(20,10,0,0.85)', border: '1px solid rgba(180,100,0,0.3)' }}
      >
        <span
          className="font-mono text-2xl tracking-widest"
          style={{
            color: glitch ? '#ef4444' : '#f59e0b',
            textShadow: glitch
              ? '2px 0 #f00, -2px 0 #0ff, 0 0 12px rgba(240,0,0,0.8)'
              : '0 0 8px rgba(245,158,11,0.8), 0 0 16px rgba(245,158,11,0.4)',
            animation: glitch ? 'pulse 0.5s infinite' : 'none',
            letterSpacing: '0.15em',
          }}
        >
          [{floor}]
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && git add src/components/ui/FloorDisplay.tsx && git commit -m "feat: nixie tube style for FloorDisplay"
```

---

## Task 6: GameScene 통합

**Files:**
- Modify: `src/components/scene/GameScene.tsx`

가장 복잡한 태스크. 아래 변경 사항을 순서대로 적용한다.

### 추가되는 것
1. RpsResultOverlay 표시 흐름 (held breath → overlay → 씬 전환)
2. ChoiceInput (PHASE_2_QUESTION 씬)
3. 손 인식 안내 (첫 진입 시)
4. GhostSilhouette에 `approaching`, `frameIntrude` 전달
5. pendingReaction 독백 표시

- [ ] **Step 1: import 추가**

파일 상단 import 블록에 추가:
```typescript
import RpsResultOverlay from './RpsResultOverlay'
import ChoiceInput from '../interaction/ChoiceInput'
import { getGhostQuestion } from '../../data/ghostQuestions'
import type { GhostQuestion } from '../../data/ghostQuestions'
```

- [ ] **Step 2: useGameState에서 setReaction 추가로 받기**

```typescript
const { state, goTo, submitPhase1Gesture, submitPhase2Gesture, updateHandLost, startPhase2Signal, tickPhase2Signal, setReaction } = useGameState()
```

- [ ] **Step 3: 새 상태 변수 추가 (기존 useState 목록 아래)**

```typescript
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
```

- [ ] **Step 4: PHASE_1_RPS 첫 진입 감지 — useEffect 추가**

```typescript
useEffect(() => {
  if (scene === 'PHASE_1_RPS' && !handGuideShownRef.current) {
    setShowHandGuide(true)
  }
}, [scene])
```

- [ ] **Step 5: 손 인식 성공 시 안내 숨기기 — onHandLost 콜백 수정**

기존:
```typescript
onHandLost: (s) => { setPalmX(null); updateHandLost(s) },
```
변경:
```typescript
onHandLost: (s) => {
  setPalmX(null)
  updateHandLost(s)
  if (s === 0 && showHandGuide) {
    setShowHandGuide(false)
    handGuideShownRef.current = true
  }
},
```

- [ ] **Step 6: submitPhase1Gesture / submitPhase2Gesture를 오버레이 경유로 변경**

기존 useHandTracking의 onGesture:
```typescript
onGesture: (g) => {
  if (scene === 'PHASE_1_RPS') submitPhase1Gesture(g)
  if (scene === 'PHASE_2_RPS') submitPhase2Gesture(g)
},
```

변경 (오버레이 먼저 표시):
```typescript
onGesture: (g) => {
  if (scene === 'PHASE_1_RPS') {
    // 결과 미리 계산 (tie or loss in Phase 1)
    const result = g === 'paper' ? 'tie' : 'loss'
    setRpsOverlay({
      playerGesture: g,
      result,
      phase: 'phase1',
      pendingScene: () => submitPhase1Gesture(g),
    })
  }
  if (scene === 'PHASE_2_RPS') {
    // Phase 2는 오버레이 후 submitPhase2Gesture 호출
    // 결과는 submitPhase2Gesture 내부 랜덤에 의존 — 오버레이 표시 전 미리 결과 계산 필요
    // 해결: 오버레이 시작 시점에 결과를 확정하고 pendingScene에 람다로 전달
    const isScissors = g === 'scissors'
    const round = state.phase2.round
    const winRoll = round === 3 ? true : Math.random() < 0.2
    const result: 'win' | 'loss' = isScissors && winRoll ? 'win' : 'loss'
    setRpsOverlay({
      playerGesture: g,
      result,
      phase: 'phase2',
      pendingScene: () => {
        // 이미 계산된 result를 반영하는 씬 전환
        if (result === 'win') {
          goTo('WIN_CUTSCENE')
        } else {
          const newLosses = state.phase2.losses + 1
          const newQA = state.phase2.questionsAnswered + 1
          if (newLosses >= 3 || round >= 3) {
            // 프레임 침입 후 BAD_ENDING
            setFrameIntrude(true)
            setTimeout(() => { setFrameIntrude(false); goTo('BAD_ENDING') }, 400)
          } else {
            // 다음 라운드로 (useGameState의 submitPhase2Gesture 대신 직접 goTo)
            submitPhase2Gesture(g)
          }
        }
      },
    })
  }
},
```

**주의:** Phase 2에서는 랜덤 결과를 오버레이 시작 전에 확정하여 오버레이와 실제 씬 전환이 일치하도록 한다. 단, "다음 라운드"인 경우에는 `submitPhase2Gesture(g)`를 그대로 호출해 기존 상태 머신을 활용한다.

- [ ] **Step 7: Phase 2 타이머 일시정지 처리**

기존 Phase 2 signal tick useEffect:
```typescript
useEffect(() => {
  if (!state.phase2SignalActive) return
  // rpsOverlay가 표시 중이면 타이머 정지
  if (rpsOverlay !== null) return
  let last = Date.now()
  ...
}, [state.phase2SignalActive, tickPhase2Signal, rpsOverlay])
```

- [ ] **Step 8: GhostSilhouette에 approaching, frameIntrude 전달**

Phase 2 귀신 (오른쪽):
```tsx
{isPhase2 && (
  <GhostSilhouette
    size={100}
    opacity={1}
    position="right"
    approaching={scene === 'PHASE_2_RPS' && state.phase2SignalActive && rpsOverlay === null}
    frameIntrude={frameIntrude}
  />
)}
```

- [ ] **Step 9: RpsResultOverlay 렌더링 추가**

JSX 마지막 부분 (`</div>` 직전)에 추가:
```tsx
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
```

- [ ] **Step 10: PHASE_2_QUESTION 씬 교체**

기존:
```tsx
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
```

변경:
```tsx
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

{scene === 'PHASE_2_REACTION' && state.pendingReaction && (
  <div className="absolute inset-0 z-50 flex items-end justify-center pb-16">
    <p
      className="font-mono text-gray-300 text-base tracking-wide"
      style={{ fontStyle: 'italic' }}
    >
      {state.pendingReaction}
    </p>
  </div>
)}
```

- [ ] **Step 11: PHASE_2_REACTION 씬 ID 추가**

`src/types/game.ts` 의 SceneId에 추가:
```typescript
export type SceneId =
  | 'IDLE'
  | 'SCENE_01' | 'SCENE_02' | 'SCENE_03'
  | 'PHASE_1_RPS'
  | 'PHASE_2_ENTRY'
  | 'PHASE_2_RPS'
  | 'PHASE_2_QUESTION'
  | 'PHASE_2_REACTION'   // ← 추가
  | 'WIN_CUTSCENE'
  | 'BAD_ENDING'
  | 'DEAD_ENDING'
  | 'JUMP_SCARE'
  | 'ESCAPE_FROST'
  | 'ESCAPE_HOLD'
  | 'TRUE_ENDING'
```

PHASE_2_REACTION은 1.5초 후 자동으로 PHASE_2_RPS로 전환:
```typescript
useEffect(() => {
  if (scene !== 'PHASE_2_REACTION') return
  const t = setTimeout(() => {
    setReaction(null)
    goTo('PHASE_2_RPS')
  }, 1500)
  return () => clearTimeout(t)
}, [scene])
```

- [ ] **Step 12: 손 인식 안내 표시**

GestureOverlay 위에 (또는 내부에) 추가:
```tsx
{scene === 'PHASE_1_RPS' && (
  <GestureOverlay
    active={true}
    holdProgress={holdProgress}
    currentGesture={currentGesture}
    handGuide={showHandGuide}  // GestureOverlay가 이 prop을 받도록 수정 필요
  />
)}
```

`src/components/ui/GestureOverlay.tsx` 에 `handGuide?: boolean` prop 추가:
```tsx
{handGuide && (
  <p className="text-gray-400 font-mono text-xs text-center mb-2 animate-pulse">
    카메라에 손을 보여주세요
  </p>
)}
```

- [ ] **Step 13: 빌드 확인**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && npx tsc --noEmit 2>&1
```
Expected: 에러 없음

- [ ] **Step 14: 커밋**

```bash
cd /Users/yeonhee/Desktop/Archive/mirror-vn && git add src/components/scene/GameScene.tsx src/types/game.ts src/components/ui/GestureOverlay.tsx && git commit -m "feat: integrate RPS overlay, ChoiceInput, ghost animations, hand guide"
```

---

## 자체검토 (Spec Coverage)

| 스펙 항목 | 구현 태스크 |
|-----------|------------|
| RPS 결과 오버레이 + held breath | Task 3 (RpsResultOverlay), Task 6 Step 6,9 |
| 귀신 패 계산 (getGhostMove) | Task 3 |
| Phase 2 타이머 오버레이 중 정지 | Task 6 Step 7 |
| Ghost approaching 애니메이션 | Task 4, Task 6 Step 8 |
| 프레임 침입 (frameIntrude) | Task 4, Task 6 Step 6,8 |
| 손 인식 첫 진입 안내 | Task 6 Step 4,5,12 |
| ghostQuestions.ts 데이터 분리 | Task 1 |
| ChoiceInput 컴포넌트 | Task 2 |
| PHASE_2_QUESTION → ChoiceInput | Task 6 Step 10 |
| pendingReaction 독백 | Task 1 Step 3d, Task 6 Step 10,11 |
| FloorDisplay 닉시튜브 스타일 | Task 5 |
| Special Elite 폰트 | Task 3 Step 2 |
