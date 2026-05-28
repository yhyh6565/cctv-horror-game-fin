# mirror-vn — HANDOFF
Last session: 2026-05-27 | Status: active | Linear: —

## Where we left off
Completed ending screen implementation with transcript typewriter effect. Most recent work focused on Phase 2 UX polish: added scissors-only hint text, input-locked visual feedback (⏳ flash), and reaction progress bar countdown before auto-transition. README updated with full flow diagram and ending conditions. Game is mechanically complete and playable end-to-end.

## What's next
- [ ] Test ending screen UX improvements (typewriter timing, transcript clarity, retry button)
- [ ] iOS Safari webcam permission flow testing (non-standard gate on iOS 16+)
- [ ] Desktop Chrome cross-browser gesture recognition validation (especially hand occlusion edge cases)

## Open decisions
- Whether to add difficulty modifiers (e.g., faster Phase 2 timer, more rounds) — not in scope until user requests
- Jump scare timing refinement — currently 5s hand loss; may need tuning based on playtesting

## Context for Claude
- Stack: TypeScript, pure web (no RPG Maker), Vite, WebRTC webcam API
- Mirror scene uses CSS 3D transform (not canvas)
- Hand gesture: debounce 300ms minimum or false triggers
- iOS Safari webcam permission flow differs from Chrome — test iOS first
- Do NOT attempt Three.js — overkill, was reverted previously
- Ending screen flow: all bad/dead/jump-scare paths funnel to ENDING_SCREEN with transcript
- True Ending uses Groq LLM for freeform Q&A after escape sequence
