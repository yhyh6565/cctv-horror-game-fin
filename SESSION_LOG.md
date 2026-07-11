# mirror-vn — Session Log

<!-- Append new entries at the top. Format: ## YYYY-MM-DD -->

## 2026-07-11
**Done:**
- PRD §4.2 Phase 2 각본 논리 결함 해결 — 원작 트랜스크립트(`docs/scenario.md`) 재확인 후 §4.1 그대로 적용안, 확률적 귀신 손 결정안 순서로 검토
- 옛 구현(`src/hooks/useGameState.ts:16`) 20% 랜덤 승리 코드 발견 — 결정 로그 #1에서 이미 폐기된 방식임을 확인, 새 메커니즘과 구분
- Phase 2 R1/R2 최종 각본 수렴: 보/바위는 결정론적 비김·패배, 가위만 50/50 확률로 승/패 (가위가 유일한 승리 경로라는 원작 속성 보존)

**Decisions:**
- Phase 2 R1/R2 귀신 손 결정 규칙: 유저 보→귀신 보(비김) / 유저 바위→귀신 보(패배) / 유저 가위→귀신 보 50%(승) 또는 바위 50%(패) ← 내 위치: §4.1을 문자 그대로 재사용하면 유저 승리 케이스가 0%가 되어 사용자 의도(가위=유일한 저확률 승리 경로)와 안 맞는다고 지적, 랜덤이 가위 분기에만 걸리는 커스텀 규칙으로 수렴 / 기각된 대안: §4.1 완전 재사용(결정론, 승리 0%) — 사용자 의도와 불일치 [G: no]
- 핵심 원칙 2("난수 0%")는 이번 결정으로 부분 예외 필요 — Phase 2 R1/R2 가위 분기만 랜덤 허용, 나머지(Phase 1, R3)는 그대로 유지 ← 내 위치: 원칙 전면 폐기 대신 조건부 명시를 제안 [G: no]

**Feedback:** —

**Blockers:**
- R1/R2 럭키 승리 시 처리(WIN_CUTSCENE 스킵 vs 판정권으로 무시) 답변 대기 — PRD 업데이트는 이 답변 이후

## 2026-07-07
**Done:**
- 리빌드 피벗: 점진 수정 대신 기획안 기준 재구축 결정
- Linear 재구성 — 구 미완료 티켓 6건 캔슬 (YEO-5/42/43/44/46/50), 부모 YEO-597 + 서브이슈 YEO-598~606 (구현 순서 0~8) 생성
- 기획 콜아웃 9건 확정 (하나씩 상황/문제/방안 논의)
- 원작 재확인 (나무위키/포스타입 정리글): 보상 질문 1회, "3번의 대답" = 귀신이 묻는 쪽, 거짓 대답 = 즉사
- `docs/PRD.md` 작성 + main 푸시 (`0398556`) — 확정 로그, RPS 각본 테이블, 타이밍 파라미터, 레이어 스택, 엔딩 분기
- YEO-598 → In Review

**Decisions:**
- 시점 = 1인칭 (CCTV 아님) — CCTV 필터 → 톤 필터로 교체
- Phase 2 힌트 제거 + 각본 확정 (난수 0%), R3 인과 독백 명시, Phase 1 패배 수 → 진입 연출 차등
- 손 이력: 라운드별 텍스트 상시 노출, 플래시백 회상 없음 (관찰 보상 구조)
- Dead Ending 타이머 = 손 감지 시점 기준 1.5s + 절대 상한 4s / 손 소실 = 3s 경고 + 5s 발동
- ESCAPE_HOLD = 검지 끝 위치 판정 + 터치 시각 피드백 + 층수 하강 진행도 + 유효 이탈 3회 실패 루프
- True Ending 질문 1회 후 자동 진행 / 귀신 질문 진실·거짓 2택 (회피 삭제), 거짓·10s 초과 = 즉사, Q3 긍정만 통과
- 모델 전략: 기본 Sonnet, 판단·카피·톤 항목만 Fable

**Feedback:**
- CCTV 톤 아님 → 시점을 시나리오에서 확인 안 하고 레포 이름으로 추정한 실수. 시나리오/원작 먼저 확인할 것
- "의식서 소품" 제안 철회됨 — 이 게임 문법은 독백 + [시스템] 라인. 새 연출 장치 도입 전에 기존 문법 확인
- "이상적 방안 논의 중에 현 구현 제약으로 보수적으로 답하지 말 것" (ESCAPE_HOLD 위치 판정)
- 회피 선택지 = 결과 없는 가짜 선택 지적 → 삭제

**Blockers:**
- PRD §4.2 논리 결함 발견 (유저 보 vs 귀신 ✊ = RPS상 유저 승) — 후출 미러링 수정안 제안 후 답변 대기

## 2026-05-31 (2차)
**Done:**
- `docs/scenario.md` 생성 + main 푸시 — 전체 게임 스크립트 씬별 타입 표기 포함
- `TextBox.tsx` 재작성: Rules of Hooks 위반 수정 (hooks before early return), Enter 키 진행, `autoAdvanceMs` 자동전환 타이머, 창 크기/글씨 개선
- `TornNotice.tsx` 신규: CSS 찢어진 종이 효과 (clip-path polygon, 테이프 마크, 나눔명조)
- `scenes.ts`: SCENE_02 안내문 `notice` 타입, SCENE_03 지시문 `autoAdvanceMs`, `[땡]` `elevator_ding` 사운드
- `useSoundManager.ts`: `playElevatorDing()` Web Audio API 합성 (880Hz sine, 1.2s decay)
- `useFaceTracking.ts`: MAX_OFFSET 20→32, `.catch()` 오류 방어
- `GameScene.tsx`: 인트로 씬 FloorDisplay 숨김, `handleSceneComplete` useCallback 안정화
- Phase 1 진입 버그 수정 2건:
  - `useGameState.ts`: `JUMP_SCARE_ALLOWED`에서 `SCENE_01/02/03` 제거
  - `useHandTracking.ts`: `cbRef` 패턴으로 `handleResults` 안정화 (60fps 재렌더 → 카메라 루프 해결)
- YEO-50 Linear 티켓 생성 (SCENE_01/02 배경 이미지 생성)

**Decisions:**
- `cbRef` 패턴 채택: `handleResults`를 stable하게 만들어 MediaPipe 카메라 재초기화 루프 방지. 콜백 props를 직접 deps에 넣는 대신 ref에 최신 값을 유지.
- TornNotice는 CSS로 먼저 구현 (이미지 생성 전 placeholder). YEO-46으로 실제 이미지 교체 예정.

**Feedback:** —

**Blockers:** —

## 2026-05-31
**Done:**
- YEO-35/36: Vercel 프로젝트 생성 + GitHub 연결 + Production 배포 (https://mirror-vn.vercel.app)
- 보안 검사 실시 — api/ask.ts 삭제 (무인증 엔드포인트), @vercel/node 제거 (CVE 6개 해소), npm audit 0 취약점
- Groq API 제거 → QuestionInput 키워드 미매칭 시 "알 수 없다." 고정 응답
- vercel.json buildCommand/outputDirectory 명시
- Background.tsx TS18048 오류 수정 (faceOffsetRef! non-null assertion)
- @vercel/analytics 추가 + inject() main.tsx 삽입 → PR #2 머지 후 재배포

**Decisions:**
- Groq API 제거: 배포 단순화 + 환경변수 없이도 게임 동작 가능. 엔딩 트리거는 키워드 매칭이라 영향 없음.
- api/ask.ts 삭제: Vercel이 api/ 폴더를 자동 감지해 serverless function으로 배포 → 보안 위험 제거

**Feedback:** —

**Blockers:**
- Vercel Deployment Protection 기본값으로 켜져 있어 배포 후 외부 접근 불가 → 대시보드에서 수동으로 꺼야 했음

## 2026-05-30
**Done:** 별도 코드 작업 없음. 사운드 파일 로컬 미리보기 방법 확인 (afplay / Finder 스페이스바).
**Decisions:** —
**Feedback:** —
**Blockers:** —

## 2026-05-29 (2차)
**Done:**
- YEO-15: 사운드 12개 CC0/Public Domain 소스에서 직접 다운로드 + public/sounds/ 배치
- mirror_bang.mp3 (Personal Use Only) → CC0 thwack.wav (OpenGameArt)로 교체
- useSoundManager 경로 업데이트 (whisper.wav, bad_drone.ogg, mirror_bang.wav)
- YEO-15~19 전부 Linear Done 처리

**Decisions:**
- mirror_bang Personal Use Only 라이선스 발견 → CC0로 즉시 교체 (공개 배포 고려)
- freesound.org 대신 OpenGameArt + SoundBible 사용 (직접 curl 다운로드 가능)

**Feedback:**
- 코드 변경을 feature branch 없이 main에 직접 커밋함 → CLAUDE.md에 "코드 작업 전 반드시 branch 먼저" 규칙 강화됨

**Blockers:** —

## 2026-05-29 (1차)
**Done:**
- 전체 QA 실시 — 5개 버그 발견 (Critical 3, Medium 2)
- Linear 티켓 YEO-15~19 생성 (버그별 원인 + 해결 방안 포함)
- YEO-16: JUMP_SCARE 씬 가드 추가 (`useGameState.ts`)
- YEO-17: TRUE_ENDING 출구 연결 — ENDING_SCREEN_TRUE 신규, EndingScreen 'true' 타입 추가
- YEO-18: `useSoundManager` unmount cleanup (Howl 인스턴스 leak 방지)
- YEO-19: PHASE2_ROUND2_TIE / PHASE2_ROUND3_SETUP 씬 GameScene에 연결

**Decisions:**
- TRUE_ENDING 이후 흐름: 방법 A (EndingScreen 재활용 + 전용 트랜스크립트) 채택

**Feedback:** —

**Blockers:**
- YEO-15 (사운드): freesound.org 직접 다운로드 불가 → OpenGameArt/SoundBible으로 우회 해결

## 2026-05-28
**Done:** Initialized HANDOFF and SESSION_LOG as part of personal workflow system setup.
**Decisions:** Using HANDOFF.md for session continuity; SESSION_LOG.md for historical record; CLAUDE.md for project-specific rules.
**Feedback:** —
**Blockers:** —
