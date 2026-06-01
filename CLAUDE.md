# mirror-vn — Claude Instructions

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

## Known issues / Do not repeat
- Three.js: attempted and reverted — overkill for 2D scene
- iOS 16 webcam permission gate is non-standard — handle separately

## Linear
Project: **mirror-vn** (ID: `3ff2df06-cef6-47e8-b64d-732a2860b847`)
When creating any ticket for this repo, always pass `project: "mirror-vn"`.
