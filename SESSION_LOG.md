# mirror-vn — Session Log

<!-- Append new entries at the top. Format: ## YYYY-MM-DD -->

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
