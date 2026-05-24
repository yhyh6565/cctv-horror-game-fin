# UX 개선 설계 스펙 — 거울을 보지 마세요

> 원작: 괴담에 얼어져도 출근을 해야 하는구나 / 백덕수 (Qterw-D-718)
> 레퍼런스: ATHYRA: Rock, Paper, Scissors / Buckshot Roulette / I'm on Observation Duty

---

## 배경 및 목표

현재 게임의 RPS 루프는 플레이어가 제스처를 내면 결과가 즉각 씬 전환으로 처리돼 공허하게 느껴진다. 귀신의 패가 보이지 않아 승패 이유를 알 수 없고, Phase 2의 귀신 질문 장면은 "계속 →" 버튼만 있어 상호작용이 없다.

목표: RPS 루프를 명확하고 긴장감 있게 재구성하고, 귀신 질문을 선택지 기반으로 전환하며, 전반적인 horror 비주얼을 강화한다.

---

## 1. RPS 결과 오버레이 (RpsResultOverlay)

### 개요
제스처 인식 후 즉시 씬 전환하는 대신, 1.8초간 결과 오버레이를 표시한 뒤 자동 전환한다.

### 흐름
```
제스처 인식 (800ms hold)
  → 0.5초 공백 (held breath — Buckshot Roulette 패턴)
  → 오버레이 등장: 나: [패] / 귀신: [패] / [결과]
  → 1.8초 후 자동 전환 (씬 변경)
```

### 오버레이 UI
```
나: 가위     귀신: 바위
        졌다.
```
- 위치: 화면 중앙
- 배경: 반투명 검정 (`rgba(0,0,0,0.75)`)
- 폰트: horror distressed 스타일 (Google Fonts "Special Elite" 또는 monospace + letter-spacing)
- 텍스트 색: 흰색, 결과 텍스트("졌다"/"이겼다"/"비겼다")는 크기 1.5배
- 결과에 따른 색: 이겼다 → 흰색, 졌다 → 붉은색, 비겼다 → 회색

### 귀신 패 계산 로직

```
function getGhostDisplayMove(playerGesture, result):

  Phase 1:
    ('paper', 'tie')  → 'paper'   // 원작: 비길 때 같은 패
    ('rock', 'loss')  → 'paper'   // 보자기 > 바위
    ('scissors', 'loss') → 'rock' // 바위 > 가위

  Phase 2:
    ('scissors', 'win')  → 'paper' // 가위 > 보자기 — 이길 수 있는 유일한 경우
    ('scissors', 'loss') → 'rock'  // 바위 > 가위
    ('rock', 'loss')     → 'paper' // 보자기 > 바위
    ('paper', 'loss')    → '???'   // 귀신은 가위를 못 냄 — 초자연적 승리, 모호하게 처리
```

`???` 처리: "귀신: ???" 텍스트 표시. INSIGHT 발견("귀신은 가위를 못 낸다")과 모순 없이 유지.

### Phase 2 타이머 동작
- 오버레이 표시 중 타이머 일시정지
- 오버레이 사라진 후 타이머 재개 (남은 시간부터)

---

## 2. 귀신 애니메이션 — 타이머 중 압박 (Inscryption 패턴)

### 개요
Phase 2 타이머 1500ms 동안 귀신 실루엣이 천천히 앞으로 기울어진다. "귀신이 내 선택을 기다리며 보고 있다"는 압박감.

### 구현
```css
@keyframes ghostApproach {
  from {
    transform: translateX(-50%) scale(1.0) translateY(0);
  }
  to {
    transform: translateX(-50%) scale(1.04) translateY(-8px);
  }
}
```
- `phase2SignalActive === true`일 때 GhostSilhouette에 적용
- `animation-duration: 1500ms`, `animation-timing-function: ease-in`, `animation-fill-mode: forwards`
- 타이머 리셋 시 원위치로 돌아옴

---

## 3. 프레임 침입 — Phase 2 패배 시 (I'm on Observation Duty 패턴)

### 개요
Phase 2에서 마지막 라운드 패배 → BAD_ENDING 전환 직전, 귀신 실루엣이 0.4초간 화면을 가득 채운다.

### 흐름
```
패배 결과 확정
  → RpsResultOverlay 표시 ("졌다", 1.8초)
  → 귀신 실루엣: scale 100vh → 250vh, opacity 1, transition 0.4s
  → 0.4초 후 BAD_ENDING 씬 전환
```

### 조건
- Phase 2에서 losses >= 3 OR round >= 3 → BAD_ENDING 경로일 때만 적용
- Phase 1 패배 시에는 적용하지 않음

---

## 4. 손 인식 진입 안내

### 개요
PHASE_1_RPS 첫 진입 시 카메라에 손을 보여야 한다는 걸 모르는 플레이어를 위한 안내.

### 동작
- `useRef<boolean>`으로 첫 진입 여부 추적
- 첫 진입 + 손이 아직 인식 안 됨 → GestureOverlay 상단에 안내 텍스트 표시:
  ```
  카메라에 손을 보여주세요
  ```
- `onHandLost(0)` 콜백 (손 인식 성공) 호출 시 안내 자동 숨김
- 이후 재진입 시에는 표시하지 않음 (ref 유지)

---

## 5. 귀신 질문 → 선택지 (ChoiceInput)

### 개요
PHASE_2_QUESTION 씬의 "계속 →" 버튼을 2~3개 선택지로 교체한다. 선택은 게임 엔딩에 영향 없고 이후 독백 텍스트의 톤만 달라진다.

### 데이터 구조

```typescript
// src/data/ghostQuestions.ts

interface GhostChoice {
  text: string
  reaction: string  // 선택 후 표시될 내면 독백
}

interface GhostQuestion {
  question: string
  choices: GhostChoice[]
}

export const GHOST_QUESTIONS: GhostQuestion[] = [
  {
    question: '이름이 뭐야?',  // 원작 그대로
    choices: [
      { text: '이름을 적는다', reaction: '손이 떨렸다.' },
      { text: '거짓말을 하려다 멈췄다', reaction: '위험하다. 거짓말은 안 된다.' },
      { text: '침묵한다', reaction: '하지만 침묵도 답이 아닐 것 같았다.' },
    ],
  },
  {
    question: '생일이 언제야?',  // 원작 그대로
    choices: [
      { text: '생일을 적는다', reaction: '귀신이 팔짝팔짝 뛰었다.' },
      { text: '다른 날짜를 적으려 했다', reaction: '…안 된다. 거짓말은 위험해.' },
      { text: '왜 알고 싶어?', reaction: '대답하지 않으면 안 될 것 같았다.' },
    ],
  },
  {
    question: '지금 무서워?',  // 게임 오리지널 (원작에서 3번째 질문은 등장 전 탈출)
    choices: [
      { text: '응', reaction: '솔직하게 대답했다.' },
      { text: '아니', reaction: '거짓말이었다.' },
      { text: '너한텐 안 져', reaction: '이제 어떻게 해야 할지 알았다.' },
    ],
  },
]
```

**원작 고증 노트:**
- Q1, Q2는 원작에서 확인된 질문. 원작에서 거짓 대답 = 즉사 ("거짓 대답을 한 경우: 명복을 빈다").
- 게임에서 선택지는 flavor 전용. "거짓말을 하려다 멈췄다" 선택지가 원작 규칙을 반영.
- Q3는 원작에서 솔음이 펜 트릭으로 3번째 질문 전에 탈출했기에 게임 오리지널로 처리.

### ChoiceInput 컴포넌트

```typescript
// src/components/interaction/ChoiceInput.tsx

interface Props {
  question: string
  choices: GhostChoice[]
  onSelect: (reaction: string) => void
}
```

### 스타일링 (Horror Aesthetic)
- 배경: 순수 검정 (`#000`) 또는 반투명 검정 오버레이
- 질문 텍스트: ghost TextBox 스타일로 표시 (기존 TextBox 재활용)
- 선택지 버튼:
  - 전체 너비, 세로 목록
  - border: `1px solid rgba(180, 0, 0, 0.4)` (어두운 붉은 테두리)
  - 배경: 투명
  - 글꼴: monospace, letter-spacing 약간
  - hover: border-color `rgba(200, 30, 30, 0.9)`, text-shadow 붉은 glow
  - 클릭 후: 선택된 버튼 강조, 나머지 fade out, 0.6초 후 reaction 독백 표시 후 씬 전환
  - reaction 독백: TextBox의 `inner` 타입으로 화면 하단에 표시, 클릭 없이 1.5초 후 자동으로 PHASE_2_RPS 전환

---

## 6. ATHYRA 비주얼 참조 요소

### FloorDisplay — 닉시튜브 스타일
```
현재: 회색 텍스트 "[5F]"
변경: amber/orange 글로우, 어두운 배경 패널, monospace
```
- 색상: `#f59e0b` (amber) with `text-shadow: 0 0 8px #f59e0b`
- 배경: `rgba(20, 10, 0, 0.8)` 패널
- 폰트: monospace, letter-spacing: 0.15em

### 결과 오버레이 — Distressed 폰트
- Google Fonts "Special Elite" (serif, typewriter-distressed 느낌)
- 또는 시스템 monospace + `filter: contrast(1.2)`

### 전반적 어둠 강화
- Background 컴포넌트의 기본 brightness를 Phase 1에서도 약간 낮춤: `0.85` → 현재 `1`
- CctvFilter vignette 강도 증가

---

## 7. 영향받는 파일 목록

### 신규 생성
- `src/components/interaction/ChoiceInput.tsx` — 선택지 UI
- `src/components/scene/RpsResultOverlay.tsx` — RPS 결과 오버레이
- `src/data/ghostQuestions.ts` — 귀신 질문 + 선택지 데이터

### 수정
- `src/components/scene/GhostSilhouette.tsx` — 타이머 중 approachAnimation 추가, 프레임 침입 지원
- `src/components/scene/GameScene.tsx` — RpsResultOverlay 연결, ChoiceInput 연결, 손 안내 로직
- `src/components/ui/FloorDisplay.tsx` — 닉시튜브 스타일
- `src/hooks/useGameState.ts` — 선택 반응 상태 추가 (`pendingReaction`)
- `src/types/game.ts` — 필요 시 타입 추가
- `src/data/scenes.ts` — ghostQuestions.ts로 GHOST_QUESTIONS 이동 (useGameState에서 import 변경)

---

## 8. 구현 우선순위

1. **ghostQuestions.ts + ChoiceInput** — 씬 데이터 분리 및 선택지 UI
2. **RpsResultOverlay** — RPS 루프 핵심 개선
3. **GhostSilhouette 애니메이션** — Phase 2 압박감
4. **프레임 침입** — BAD_ENDING 연출
5. **손 인식 안내** — 온보딩
6. **FloorDisplay 닉시튜브** — 비주얼 polish
