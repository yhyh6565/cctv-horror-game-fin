# mirror-vn — HANDOFF
Last session: 2026-05-29 | Status: active | Linear: YEO-15~19

## Where we left off
전체 QA 실시 → 버그 5개 발견 → Linear 티켓 생성(YEO-15~19) → 코드 픽스 4개 완료 후 커밋.

완료된 픽스:
- **YEO-16 (C2):** `updateHandLost`에 JUMP_SCARE_ALLOWED 씬 가드 추가. 엔딩 화면 중 JUMP_SCARE 발동 방지.
- **YEO-17 (C3):** TRUE_ENDING → ENDING_SCREEN_TRUE 연결. EndingScreen에 'true' 타입 + 트랜스크립트 추가. 게임 stuck 해소.
- **YEO-18 (M1):** `useSoundManager`에 unmount cleanup 추가. retry 후 사운드 leak 방지.
- **YEO-19 (M2):** PHASE2_ROUND2_TIE, PHASE2_ROUND3_SETUP 씬 GameScene에 연결. 펜 트릭 내러티브 복원.

미완료:
- **YEO-15 (C1):** 사운드 파일 12개 직접 다운로드 필요. `public/sounds/`에 배치 후 커밋.

## What's next
**YEO-15:** freesound.org에서 사운드 파일 12개 다운로드 → `public/sounds/`에 배치 → 커밋. (이전 세션 HANDOFF의 freesound URL 목록 참고)

## Open decisions
- True Ending 트랜스크립트 내용 최종 확인 필요 ("의식 성공적으로 종료됨" 톤이 맞는지)
- M2 Phase2Round2Confirm 트리거 조건: insightTriggered가 없을 때도 발동해야 하는지 (현재는 insightTriggered=true일 때만 발동)
- 사운드 파일 CC BY 4개 크레딧 어디에 넣을지 (README? 게임 내 화면?)

## Context for Claude
- Freesound 다운로드 목록은 이전 세션 대화에 있음 (elevator_loop, door_creak 등 12개 URL)
- 커밋: `e006d21` — "fix: QA bugfixes — JUMP_SCARE guard, TRUE_ENDING exit, sound cleanup, narrative scenes"
- 코드 변경은 main 브랜치에 직접 커밋됨 (Draft PR 미생성 — 사운드 파일 추가 후 함께 PR 여는 것 고려)
- Stack: TypeScript, Vite, WebRTC webcam API, pure web (no RPG Maker, no Three.js)
- Mirror scene uses CSS 3D transform (not canvas)
- Hand gesture: debounce 300ms minimum or false triggers
- iOS Safari webcam permission flow differs from Chrome — still untested
- Do NOT attempt Three.js — overkill, was reverted previously
