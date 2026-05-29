# mirror-vn — HANDOFF
Last session: 2026-05-29 | Status: active | Linear: YEO-15~19 전부 Done

## Where we left off
QA에서 발견한 버그 5개 전부 완료. 사운드 파일 포함 모든 픽스가 main에 push됨.

완료된 전체 픽스:
- **YEO-16 (C2):** JUMP_SCARE_ALLOWED 씬 가드 추가 — 엔딩 중 발동 방지
- **YEO-17 (C3):** TRUE_ENDING → ENDING_SCREEN_TRUE 연결 + 트랜스크립트
- **YEO-18 (M1):** useSoundManager unmount cleanup (Howl leak 방지)
- **YEO-19 (M2):** PHASE2_ROUND2_TIE / PHASE2_ROUND3_SETUP 씬 연결 (펜 트릭 내러티브)
- **YEO-15 (C1):** 사운드 12개 `public/sounds/`에 배치. 전부 CC0/Public Domain.
  - 포맷 혼재: .mp3 (9개), .wav (whisper, mirror_bang), .ogg (bad_drone)
  - useSoundManager 경로 업데이트 완료

## What's next
게임을 직접 실행해서 사운드 + 전체 플로우 최종 확인 (`npm run dev`).
특히 확인할 것: elevator_loop 루프 여부, ghost_signal 길이(2.7MB — 너무 길 수 있음), jumpscare 타이밍.

## Open decisions
- True Ending 트랜스크립트 톤 확인 ("의식 성공적으로 종료됨"이 세계관에 맞는지)
- M2 Round2Confirm 트리거: insightTriggered 없을 때도 발동해야 하는지 (현재 insightTriggered=true 조건부)
- CC BY 라이선스 파일 3개 크레딧 처리 (door_creak CC BY, mirror_shatter CC BY, jumpscare CC BY) — README 또는 게임 내 화면

## Context for Claude
- 모든 변경 main 브랜치에 직접 커밋됨. Draft PR 없이 진행 (⚠️ 다음 세션부터는 CLAUDE.md 규칙대로 코드 작업 전 feature branch 먼저 생성)
- 사운드 파일 경로: whisper → .wav, bad_drone → .ogg, mirror_bang → .wav (나머지 .mp3)
- Stack: TypeScript, Vite, WebRTC webcam API, pure web (no RPG Maker, no Three.js)
- Hand gesture: debounce 300ms minimum
- iOS Safari webcam permission 미테스트
- Do NOT use Three.js
