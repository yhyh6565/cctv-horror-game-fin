# 거울을 보지 마세요

> 엘리베이터 귀신 가위바위보 의식 — 웹캠 손 인식 기반 호러 비주얼 노벨

카카오페이지 웹소설 **「괴담에 떨어져도 출근을 해야 하는구나」** 수록 괴담 「거울을 보지 마세요」(사건 ID: **Qterw-D-718**)를 원작으로 한 인터랙티브 호러 게임.  
실제 손을 카메라에 비춰 귀신과 가위바위보를 하고, 엘리베이터에서 탈출하라.

---

## 플레이 방법

1. 웹캠을 허용하고 화면을 클릭해 시작
2. 거울 속 귀신과 가위바위보 — 손 제스처를 카메라에 보여주면 자동 인식
3. **페이즈 1:** 보를 내면 비김, 바위/가위를 내면 귀신이 가까워짐 (4패 or 5라운드 → 페이즈 2)
4. **페이즈 2:** 가위만 이김. 귀신이 가위를 한 번도 낸 적 없다는 걸 이용하라
5. **탈출 시퀀스:** 손바닥으로 유리창 서리 닦기 → 검지 3초 유지

### 손 제스처

| 제스처 | 역할 |
|--------|------|
| ✊ 바위 | RPS |
| 🖐 보 | RPS (페이즈 1에서 비김) |
| ✌ 가위 | RPS / 페이즈 2 유일한 승리 수단 |
| ☝ 검지 | 탈출 열림 버튼 유지 |
| 🖐 손바닥 이동 | 서리 닦기 (손목 X축) |

> 손이 5초 이상 화면에서 사라지면 점프 스케어

---

## 게임 흐름

```
IDLE
  → SCENE_01~03 (도입부)
  → PHASE_1_RPS (가위바위보 루프, 최대 5라운드)
      ↓ 4패 or 5라운드
  → PHASE_2_ENTRY (귀신이 옆에 선다)
  → PHASE_2_RPS (1.5초 타이머, 가위로만 이김)
      ↓ 패배 시
  → PHASE_2_QUESTION (귀신 질문 — 3지선다)
  → PHASE_2_REACTION (선택 독백, 1.5초)
      ↓ 이겼을 때
  → WIN_CUTSCENE
  → ESCAPE_FROST (서리 닦기)
  → ESCAPE_HOLD (검지 3초)
  → TRUE_ENDING (자유 질문 → Groq LLM 답변)

BAD_ENDING / DEAD_ENDING / JUMP_SCARE 컷씬 종료 후:
  → ENDING_SCREEN (탐사기록 트랜스크립트 타자기 출력)
  → "다시 하기" 버튼 → 전체 리마운트 (IDLE로 복귀)
```

---

## 엔딩

| 엔딩 | 조건 | 이후 |
|------|------|------|
| **True Ending** | 탈출 완료 후 거울에 질문 — 거울 속 존재가 진실 답변 | — |
| **Bad Ending** | 페이즈 2에서 3패 또는 3라운드 실패 | 탐사기록 #47 트랜스크립트 → 다시 하기 |
| **Dead Ending** | 페이즈 2 신호 1.5초 내 미응답 | 탐사기록 #47 트랜스크립트 → 다시 하기 |
| **Jump Scare** | 손 5초 소실 | 탐사기록 #47 트랜스크립트 → 다시 하기 |

---

## 기술 스택

| 항목 | 상세 |
|------|------|
| **React 18 + TypeScript + Vite** | 게임 엔진 없이 CSS z-index 레이어만으로 씬 구성 |
| **MediaPipe Hands** | 실시간 손 제스처 인식 (RPS / 검지 포인팅 / 손바닥 트래킹) |
| **MediaPipe FaceDetection** | 얼굴 위치 오프셋으로 배경 시차 효과 (60fps rAF 루프) |
| **Canvas2D** | 서리 닦기 (`destination-out` 합성 모드) |
| **Howler.js** | SFX 12종 |
| **Groq API** (`llama-3.3-70b`) | True Ending 자유 질문 응답 (Vercel Serverless 프록시) |
| **Tailwind CSS v4** | 스타일링 |
| **Special Elite** (Google Fonts) | RPS 결과 오버레이 distressed 폰트 |

---

## 주요 UX 구현

### RPS 결과 오버레이
가위바위보 인식 후 즉시 씬 전환하는 대신 결과를 시각화:
```
제스처 인식
  → 0.5초 공백 (held breath)
  → 오버레이: 나: [패] / 귀신: [패] / 졌다.
  → 1.8초 후 자동 전환
```
귀신 패는 원작 규칙에 따라 계산 — `paper+loss` 조합은 초자연적 패배로 `???` 표시.

### 귀신 접근 애니메이션
페이즈 2 타이머 중 귀신 실루엣이 천천히 앞으로 기울어진다 (Inscryption 패턴).

### 프레임 침입
BAD_ENDING 직전 귀신 실루엣이 0.4초간 화면을 가득 채운다.

### 귀신 질문 선택지
`PHASE_2_QUESTION` 씬의 "계속 →" 버튼을 3지선다로 교체. 선택에 따라 내면 독백 텍스트가 달라지며 1.5초 후 자동 전환.

### 배경 시차
얼굴이 화면 중앙에서 벗어난 거리만큼 배경이 반대 방향으로 이동 — 공간감 연출.

### 엔딩 트랜스크립트 화면
Bad / Dead / Jump Scare 엔딩 컷씬 이후 공통으로 표시되는 탐사기록 화면:
```
[ 꿈결 수집기 신호 감지 중... ]  (1.5초 점멸)
[ 자동 회수 완료 ]
탐사기록 #47 — Qterw-D-718     (타자기 효과, 40ms/글자)
...
"다시 하기" 버튼 (fade-in)
```
엔딩별로 다른 사건 경위가 기록된다. 재시작 시 컴포넌트 전체를 리마운트해 모든 상태를 초기화.

### Phase 2 가위 힌트
Phase 2 RPS 진행 중 화면 하단에 "✌ 가위만 이긴다" 텍스트가 점멸 표시된다.

### 오버레이 중 입력 묵살 피드백
RPS 결과 오버레이가 떠 있는 동안 제스처 입력이 차단될 때 ⏳ 아이콘이 0.4초간 flash 표시.

### PHASE_2_REACTION 자동전환 표시
독백 하단에 1.5초 동안 좌→우로 줄어드는 progress bar가 표시돼 자동 씬 전환 타이밍을 예고.

---

## 로컬 실행

```bash
npm install
npm run dev
```

---

## 배포 (Vercel)

```bash
vercel --prod
```

Vercel 환경변수:
```
GROQ_API_KEY=your_groq_api_key
```

Groq API 키는 [groq.com](https://groq.com) 에서 무료 발급.

---

## 에셋 준비

`public/images/`와 `public/sounds/`에 에셋이 필요합니다.

| 파일 | 설명 |
|------|------|
| `bg_0~4.png` | 엘리베이터 내부 (귀신 접근 단계별) |
| `bg_win_mirror.png` | 거울 파손 씬 |
| `bg_bad_ending.png` | 귀신이 거울 밖으로 나오는 씬 |
| `ghost_silhouette.png` | 귀신 실루엣 투명 PNG |
| `crack_1~3.png` | 거울 균열 오버레이 3단계 |
| `sounds/*.mp3` | SFX 12종 (`elevator_loop`, `glitch`, `door_creak`, `ghost_signal`, `mirror_bang`, `mirror_shatter`, `ghost_laugh`, `bad_drone`, `dead_sting`, `whisper`, `whiteout`, `jumpscare`) |

이미지 생성 프롬프트 (DALL-E 권장):

**배경 (`bg_0~4`):**
```
photorealistic interior of an old Korean apartment elevator,
worn metal walls, dim fluorescent lighting, dirty floor with scorch marks,
two mirrors on opposing walls, late night, slightly low angle,
cinematic horror atmosphere, no people, realistic photography style
```

**귀신 실루엣 (`ghost_silhouette`):**
```
full body silhouette of a young Korean woman in business casual attire,
standing upright facing forward, completely black void with no texture,
transparent PNG background, sharp silhouette edges,
humanoid shape clearly visible, studio cutout
```

---

## 레퍼런스

- **ATHYRA: Rock, Paper, Scissors** — 닉시튜브 디스플레이, distressed 폰트
- **Buckshot Roulette** — held breath pause (결과 공개 전 정적)
- **Inscryption** — 귀신 타이머 중 접근 연출
- **I'm on Observation Duty** — 프레임 침입 (BAD_ENDING 직전)

---

## 원작 및 팬 유니버스

이 프로젝트는 카카오페이지 웹소설 **「괴담에 떨어져도 출근을 해야 하는구나」** (카카오엔터테인먼트, 백덕수 作)의 비상업적 팬 창작물입니다.

수록 괴담 「거울을 보지 마세요」(사건 ID: Qterw-D-718)를 인터랙티브 게임으로 재구성했습니다.  
원작의 모든 캐릭터, 설정, 세계관에 대한 권리는 원작자 및 카카오엔터테인먼트에 있습니다.
