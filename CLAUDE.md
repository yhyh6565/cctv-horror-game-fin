# mirror-vn — Claude Instructions

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
