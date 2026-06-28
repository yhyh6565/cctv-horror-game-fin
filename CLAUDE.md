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

## Wiki type: code

---
<!-- common-rules: v1, 2026-06-07 -->
## Common Rules (auto-synced from Archive/CLAUDE.md)

### Subagent worktree rule
서브에이전트 디스패치 전 체크: 현재 브랜치에 main 대비 커밋이 있고 + 서브에이전트 작업이 그 커밋에 의존하면 → `isolation: "worktree"` 빼고 현재 컨텍스트에서 실행. worktree는 항상 main에서 분기하므로 브랜치 변경을 모름.

### Response style
- Korean input → Korean response, English → English. Match the user's language.
- Concise by default. Go deep only when asked.
- Surface tradeoffs. Don't silently pick an interpretation.

### Branch strategy
- **Non-code changes** (docs, HANDOFF, SESSION_LOG, wiki, config) → commit directly to main, no PR needed.
- **Code changes** → always use a feature branch.
  - **Before writing the first line of code**: run `git branch`. If on main, STOP — create a feature branch (name = Linear sub-issue ID, e.g. `YEO-17`) and open a Draft PR. Never commit code to main.
  - `/eod` pushes to the existing branch — it does NOT create a new branch.

### After merging a PR
- **Never commit to a merged branch.** Merged = closed. For more changes → new sub-issue + new branch.

### GitHub push rule
- Always confirm with the user before pushing to GitHub.
- After opening a PR, immediately attach the PR URL to the Linear issue via `save_issue` `links` field.

### Linear ticket ↔ PR structure
- Feature ticket (parent) = planning unit. Sub-issue (child) = one branch + one PR.
- Branch name = sub-issue ID. Feature ticket is Done only when all sub-issues are closed.
- Always set `project` field when creating tickets.

### PR splitting (before writing any code)
- Each PR must be reviewable in under 60 min (single concern).
- API + UI change = minimum 2 PRs. Show breakdown to user before creating branches.

### PR Gate — mandatory before every `gh pr create` (Draft PRs included, no exceptions)
1. `git diff main...<branch>` — review the diff
2. **Run `/security-review` — wait for completion. Fix HIGH/MEDIUM findings. Document in PR body under `## Security review`.**
3. Run `/code-review` — fix flagged issues.
4. Only then run `gh pr create`.
GitHub Actions is not a substitute. No skipping.

**절대 금지:** PR Gate를 인라인 판단("Security review: PASS — CSS만 변경")으로 대체하는 것. 반드시 `/security-review` + `/code-review` 스킬을 Skill 도구로 실행해야 함. CSS 1줄 변경이라도 예외 없음. 이 규칙은 auto mode에서도 적용.

### 구현 전 확인 순서
사용자가 질문을 하면 **답변 먼저**, 구현은 답변 후. "어떻게 생각해?", "왜 그래?", "확인해봐" 같은 질문에 코드부터 쓰지 말 것. 구현 방향이 불확실하면 `/counsel`로 검증 후 진행.

### Proactive /qa suggestion
When user signals feature complete ("이제 됐다", "다 됐어", "기능 완성", "다음으로 넘어가자", "됐고"):
> "[feature name]이 완성된 것 같네요. PRD에 done 마킹 전에 /qa 돌릴까요?"
Only at feature completion — not after every PR merge.

### /eod order
1. Update HANDOFF.md
2. Append to SESSION_LOG.md
3. Update this project's row in `~/Desktop/Archive/my-second-brain/HUB.md`
4. Run wiki-updater agent (type from `## Wiki type:` above)
5. Propose Linear issue status updates
6. Git commit + push (project repo + my-second-brain)
7. Sync any changed config files to my-second-brain/docs/setup-exports/