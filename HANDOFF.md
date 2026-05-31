# mirror-vn — HANDOFF
Last session: 2026-05-31 | Status: active | Branch: main (code on main — no feature branch this session)

## Where we left off
QA 버그 수정 세션. Phase 1 진입 버그 2건 수정 + 인트로 UX 대폭 개선.

**완료한 것:**
- `docs/scenario.md` 생성 — 전체 게임 스크립트 씬별 정리 (시나리오 문서)
- `TextBox.tsx` 재작성 — Rules of Hooks 위반 수정, Enter 키 진행, `autoAdvanceMs` 자동 전환, 창 크기/글씨 키움 (`min-h-[140px]`, `text-base`)
- `TornNotice.tsx` 신규 — CSS 찢어진 종이 효과 (SCENE_02 수리중 안내문)
- `scenes.ts` — SCENE_02 안내문 `notice` 타입 적용, SCENE_03 지시문 `autoAdvanceMs` 자동전환, `[땡]` 사운드 트리거
- `useSoundManager.ts` — `playElevatorDing()` Web Audio API 합성음 추가
- `useFaceTracking.ts` — MAX_OFFSET 20→32, `.catch()` 오류 방어 추가
- `GameScene.tsx` — 인트로 씬 중 FloorDisplay 숨김, `handleSceneComplete` useCallback 안정화
- **Phase 1 진입 버그 수정:**
  - `useGameState.ts`: `JUMP_SCARE_ALLOWED`에서 `SCENE_01/02/03` 제거 (인트로 중 점프스케어 방지)
  - `useHandTracking.ts`: `cbRef` 패턴으로 `handleResults` 안정화 (60fps 재렌더 → 카메라 stop/restart 루프 해결)

## What's next
**https://mirror-vn.vercel.app 직접 접속 → Phase 1 진입 확인**
- SCENE_01→02→03 순서대로 진행되는지 (Enter 키 작동, SCENE_03 자동전환)
- TornNotice 수리중 안내문 표시 확인
- Phase 1 RPS 진입 및 가위바위보 작동 확인

## Open decisions
- **SCENE_01/02 배경 이미지** (YEO-50): AI 이미지 생성 필요. Midjourney/DALL-E 중 어느 쪽 쓸지 결정 필요.
- CSP 헤더 미설정 — MediaPipe cdn.jsdelivr.net WASM 로드 (post-launch Medium)
- 웹캠 권한 거부 시 에러 핸들링 없음 (silent fail)
- CC BY 라이선스 3개 파일 크레딧 처리 (door_creak, mirror_shatter, jumpscare)

## Pending tickets
- **YEO-43**: ghost_laugh.mp3 + mirror_bang.wav 교체 (소리가 세계관에 안 맞음)
- **YEO-44**: bg_0.png 층수 표시 불일치
- **YEO-46**: SCENE_02 찢어진 종이 실제 이미지 교체 (현재 CSS 버전)
- **YEO-50**: SCENE_01/02 배경 이미지 생성

## Context for Claude
- Production URL: https://mirror-vn.vercel.app
- GitHub 레포: yhyh6565/cctv-horror-game-fin (main 브랜치, 직접 커밋 중 — branch 규칙 미준수 상태)
- Stack: TypeScript, Vite, React, WebRTC webcam API (no Three.js)
- `cbRef` 패턴: `useHandTracking`이 이제 callback ref로 동작 — `handleResults` deps 없음 (안정적)
- Nanum Myeongjo 폰트 Google Fonts에서 임포트 중 (CSS `@import` 순서 경고 있으나 빌드 통과)
- iOS Safari webcam permission 미테스트
