# 버그픽스 + EndingScreen 설계 스펙 — 거울을 보지 마세요

> 작성일: 2026-05-27  
> 범위: QA 리뷰에서 발견된 Critical/Major 버그 수정 + 엔딩 트랜스크립트 화면 신규 구현

---

## 배경 및 목표

QA 리뷰 결과 게임을 진행 불가 상태로 만드는 소프트락 3종, 타이머 관련 버그 2종, HoldButton 콜백 중복 호출, UX 개선 사항 3종이 발견되었다. 동시에 엔딩 이후 흐름(재시작)이 구현되지 않은 상태였다.

원작 「괴담에 떨어져도 출근을 해야 하는구나」의 세계관(꿈결 수집기 자동 회수, 탐사기록 포맷)을 활용해 엔딩 화면을 설계하고, 나머지 버그는 수술적 패치(Surgical Patch)로 수정한다.

---

## 1. EndingScreen 컴포넌트 (신규)

### 1-1. 역할

`BAD_ENDING`, `DEAD_ENDING`, `JUMP_SCARE` 세 엔딩 이후 공통으로 표시되는 화면. 원작 세계관의 탐사기록 트랜스크립트를 타자기 효과로 보여준 뒤 재시작 버튼을 표시한다.

### 1-2. 흐름

```
컷씬 종료 (onComplete 호출)
  → EndingScreen 마운트
  → 검은 화면, 1초 정적
  → "[ 꿈결 수집기 신호 감지 중... ]" 점멸 (1.5초)
  → "[ 자동 회수 완료 ]" (0.5초 유지)
  → 탐사기록 트랜스크립트 타자기 효과 (글자당 40ms)
  → 출력 완료 후 0.8초 대기
  → "다시 하기" 버튼 fade in
  → 클릭 시 → App.tsx의 key 변경 → GameScene 완전 리마운트 → IDLE
```

### 1-3. 엔딩별 트랜스크립트 내용

포맷은 원작 탐사기록 양식을 따른다: 헤더 + 3인칭 임상 서술 + 결과.

**BAD_ENDING**
```
탐사기록 #47 — Qterw-D-718
담당: 김솔음 (현장탐사팀 D조)

거울 속 존재의 질문에 총 3회 응답 완료.
이후 직원의 발화 패턴에 이상 징후 감지됨.
"나는 지금 아주 행복하다."
"빨리 집에 가지 않아도 된다."
교신 정상 종료 여부 불명확.

[ 이후 기록 없음 ]
[ 꿈결 수집기 자동 회수 완료 ]
```

**DEAD_ENDING**
```
탐사기록 #47 — Qterw-D-718
담당: 김솔음 (현장탐사팀 D조)

거울 속 존재가 응답을 요구함.
제한 시간 내 미응답.
판정승이 상대에게 이전됨.
직원의 마지막 녹음: 정적 3.2초.

[ 이후 기록 없음 ]
[ 꿈결 수집기 자동 회수 완료 ]
```

**JUMP_SCARE**
```
탐사기록 #47 — Qterw-D-718
담당: 김솔음 (현장탐사팀 D조)

의식 진행 중 손 인식 신호 소실.
경과 시간: 5.1초.
거울 속 존재가 의식 규칙 위반을 선언함.
이후 교신 두절.

[ 이후 기록 없음 ]
[ 꿈결 수집기 자동 회수 완료 ]
```

### 1-4. 비주얼 스펙

- 배경: 순수 검정 (`#000`)
- 폰트: `font-mono`, `text-sm`, `tracking-wide`
- `[ ... ]` 시스템 라인: `text-red-600` (원작 system 텍스트 색과 일치)
- 본문: `text-gray-400`
- 헤더: `text-gray-200`
- "다시 하기" 버튼: `border border-gray-600 text-gray-400 hover:text-white hover:border-white`, 투명 배경, monospace

### 1-5. 재시작 구현

`App.tsx`에 `gameKey` state 추가. EndingScreen에서 retry 시 `setGameKey(k => k + 1)`. `<GameScene key={gameKey} />`로 완전 리마운트 → 모든 useState/useRef 초기화.

```tsx
// App.tsx
const [gameKey, setGameKey] = useState(0)
<GameScene key={gameKey} onRetry={() => setGameKey(k => k + 1)} />
```

### 1-6. 연결 지점 (GameScene.tsx)

```tsx
// 기존 (no-op)
{scene === 'BAD_ENDING' && <BadEndingCutscene onComplete={() => {}} />}
{scene === 'DEAD_ENDING' && <DeadEndingCutscene />}
{scene === 'JUMP_SCARE' && <JumpScareCutscene />}

// 변경
{scene === 'BAD_ENDING' && (
  <BadEndingCutscene onComplete={() => goTo('ENDING_SCREEN_BAD')} />
)}
{scene === 'DEAD_ENDING' && (
  <DeadEndingCutscene onComplete={() => goTo('ENDING_SCREEN_DEAD')} />
)}
{scene === 'JUMP_SCARE' && (
  <JumpScareCutscene onComplete={() => goTo('ENDING_SCREEN_JUMP')} />
)}
{scene === 'ENDING_SCREEN_BAD' && <EndingScreen endingType="bad" onRetry={onRetry} />}
{scene === 'ENDING_SCREEN_DEAD' && <EndingScreen endingType="dead" onRetry={onRetry} />}
{scene === 'ENDING_SCREEN_JUMP' && <EndingScreen endingType="jump" onRetry={onRetry} />}
```

`SceneId` 타입에 `'ENDING_SCREEN_BAD' | 'ENDING_SCREEN_DEAD' | 'ENDING_SCREEN_JUMP'` 추가.

`DeadEndingCutscene`, `JumpScareCutscene`에 `onComplete?: () => void` prop 추가. 각각 내부 타이머(3초) 후 호출.

---

## 2. 타이머 버그 픽스

### 2-1. Fix 1 — PHASE_2_QUESTION 진입 시 타이머 미정지

**원인:** `submitPhase2Gesture`에서 `PHASE_2_QUESTION`으로 전환할 때 `phase2SignalActive`를 `false`로 바꾸지 않음. 질문 화면에서도 타이머가 계속 돌아 DEAD_ENDING으로 강제 전환됨.

**수정:** `useGameState.ts`의 `submitPhase2Gesture` 안에서 loss 처리 시:

```ts
// 기존
return {
  ...s,
  phase2: { ... },
  pendingQuestion: ...,
  scene: 'PHASE_2_QUESTION',
}

// 변경
return {
  ...s,
  phase2: { ... },
  pendingQuestion: ...,
  scene: 'PHASE_2_QUESTION',
  phase2SignalActive: false,   // ← 추가
  phase2SignalMs: 0,           // ← 추가
}
```

### 2-2. Fix 2 — 타임아웃 경계 레이스컨디션

**원인:** `tickPhase2Signal`이 `DEAD_ENDING`으로 전환하는 동일 프레임에 제스처 핸들러도 실행되면, 제스처 처리 결과(`WIN_CUTSCENE` 등)가 `DEAD_ENDING`을 덮어씀.

**수정:** `GameScene.tsx`의 `onGesture` 핸들러 상단에 guard 추가:

```ts
onGesture: (g) => {
  if (rpsOverlay !== null) return
  if (scene === 'PHASE_2_RPS' && !state.phase2SignalActive) return  // ← 추가
  // ...
}
```

---

## 3. HoldButton useEffect 픽스

**원인:** `useEffect`에 dependency array가 없어 매 렌더마다 실행. `onComplete`/`onFail` 콜백이 여러 번 호출됨.

**수정:** `HoldButton.tsx`를 rAF 루프 기반으로 교체. `isPointing`이 `true`인 동안만 rAF가 돌고, `false`가 되면 정리.

```ts
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

  // isPointing === true: rAF 루프
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
```

---

## 4. UX 픽스

### 4-1. Phase 2 가위 힌트

**원인:** Phase 1에서만 GestureOverlay가 표시되고, Phase 2에서는 제스처 가이드가 사라짐. 가위만 이긴다는 핵심 정보가 UI에 없음.

**수정:** `GestureOverlay`에 `phase2Mode?: boolean` prop 추가. Phase 2 RPS일 때 가위 강조 텍스트 표시:

```tsx
// GestureOverlay.tsx 내부
{phase2Mode && (
  <p className="text-red-400 font-mono text-xs text-center animate-pulse">
    ✌ 가위만 이긴다
  </p>
)}
```

GameScene.tsx에서:
```tsx
<GestureOverlay
  active={true}
  phase2Mode={scene === 'PHASE_2_RPS'}
  handGuide={scene === 'PHASE_1_RPS' ? showHandGuide : undefined}
  countdownMs={...}
/>
```

### 4-2. 오버레이 중 제스처 묵살 피드백

**원인:** `rpsOverlay !== null`일 때 제스처 입력이 무시되는데 아무 피드백 없음.

**수정:** `[inputLocked, setInputLocked]` state 추가. 제스처가 묵살될 때 0.4초간 잠금 아이콘 flash:

```tsx
onGesture: (g) => {
  if (rpsOverlay !== null) {
    setInputLocked(true)
    setTimeout(() => setInputLocked(false), 400)
    return
  }
  // ...
}

// JSX
{inputLocked && (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                  text-white text-2xl opacity-60 pointer-events-none">
    ⏳
  </div>
)}
```

### 4-3. PHASE_2_REACTION 자동전환 표시

**원인:** 1.5초 후 씬이 자동 전환되는데 아무 예고 없음.

**수정:** PHASE_2_REACTION 독백 하단에 얇은 progress bar 추가. 1.5초 동안 width 100% → 0%로 줄어듦.

CSS `transition`은 마운트 직후 초기값에서 트리거가 안 되므로 React state로 구현:

```tsx
// ReactionBar 내부 컴포넌트 (또는 인라인)
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

// GameScene JSX
{scene === 'PHASE_2_REACTION' && state.pendingReaction && (
  <div className="absolute inset-0 z-50 flex flex-col items-end justify-end pb-16 px-8 gap-3">
    <p className="font-mono text-gray-300 text-base tracking-wide italic self-center">
      {state.pendingReaction}
    </p>
    <ReactionBar />
  </div>
)}
```

---

## 5. 영향받는 파일 목록

### 신규 생성
- `src/components/scene/EndingScreen.tsx`

### 수정
- `src/types/game.ts` — SceneId에 `ENDING_SCREEN_BAD | ENDING_SCREEN_DEAD | ENDING_SCREEN_JUMP` 추가
- `src/hooks/useGameState.ts` — Fix 1 (타이머 정지)
- `src/components/scene/GameScene.tsx` — Fix 2 (레이스컨디션 guard), 엔딩 연결, UX 4-2, 4-3
- `src/components/interaction/HoldButton.tsx` — Fix 3 (rAF 교체)
- `src/components/scene/DeadEndingCutscene.tsx` — `onComplete` prop 추가 + 3초 타이머
- `src/components/scene/JumpScareCutscene.tsx` — `onComplete` 옵셔널→필수, 3초 타이머 확인
- `src/components/ui/GestureOverlay.tsx` — `phase2Mode` prop + 가위 힌트
- `src/App.tsx` — `gameKey` state + `onRetry` prop

---

## 6. 구현 우선순위

| 순서 | 작업 | 이유 |
|------|------|------|
| 1 | App.tsx + EndingScreen | 소프트락 해소, 가장 임팩트 큼 |
| 2 | DeadEndingCutscene / JumpScareCutscene onComplete | EndingScreen 연결 전제 |
| 3 | Fix 1 (타이머 정지) | PHASE_2_QUESTION 중 DEAD_ENDING 방지 |
| 4 | Fix 2 (레이스컨디션) | 타이머 경계 버그 |
| 5 | Fix 3 (HoldButton) | 탈출 씬 콜백 중복 |
| 6 | Phase 2 가위 힌트 | 핵심 메카닉 노출 |
| 7 | 오버레이 묵살 피드백 | UX polish |
| 8 | REACTION 자동전환 표시 | UX polish |
