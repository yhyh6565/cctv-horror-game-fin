# mirror-vn — Claude Instructions

> ⚠ **먼저 읽을 것:** [`docs/idea-3d-2026-11.md`](docs/idea-3d-2026-11.md) — 2026-11-18 3D 아이디어. 이 프로젝트를 살펴볼 때 가장 먼저 반영하고 무시하지 않는다. 구체화되거나 폐기되기 전까지 이 줄을 유지한다(`/wrap`이 다시 써도 지우지 않는다).

## Session start
At the start of every session, read HANDOFF.md before doing anything else.
After reading, briefly confirm: state the project name, last session date, and what's next (1-2 lines max). Example: "mirror-vn 맥락 확인 — 마지막 세션 2026-05-27, 다음: 엔딩 스크린 UX 테스트"

## PRD
Location: docs/PRD.md (not yet created — create before next implementation session)
Last reviewed: —

## Stack
TypeScript, Vite, WebRTC webcam API, pure web (no RPG Maker, no Three.js)

## QA Criteria
- [ ] Runs in browser without console errors
- [ ] Webcam hand gesture detection responds correctly (debounce tested)
- [ ] Mirror scene renders correctly on desktop Chrome
- [ ] iOS Safari webcam permission flow tested
- [ ] No broken CSS 3D transform on scene transition

## Project rules
- No feature without a PRD entry first (docs/PRD.md).
- No Three.js — use CSS 3D transforms.
- Always debounce hand gesture events 300ms minimum.
- 괴담출근 2차 창작 기준: vault `10 Personal/괴담출근/gottawork/fanwork-guideline.md`(KW북스 통합 가이드라인). 비영리 유지, 공식 자산(로고·표지·삽화·웹툰 디자인) 미사용, 비공식 팬 창작 표기, 공식 혼동 회피.

## Known issues / Do not repeat
- Three.js: attempted and reverted — overkill for 2D scene
- iOS 16 webcam permission gate is non-standard — handle separately

## Linear
Project: **mirror-vn** (ID: `3ff2df06-cef6-47e8-b64d-732a2860b847`)
When creating any ticket for this repo, always pass `project: "mirror-vn"`.

## Wiki type: code

## Vault overview

vault: 10 Personal/apps/mirror-vn/overview.md
