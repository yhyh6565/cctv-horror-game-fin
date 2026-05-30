# mirror-vn — HANDOFF
Last session: 2026-05-31 | Status: active | Linear: YEO-35, YEO-36 Done

## Where we left off
Vercel 배포 완료 + Vercel Analytics 추가 배포까지 마침.

- **YEO-35/36:** vercel.json 빌드 설정, Groq API 제거(→ "알 수 없다." 고정), 보안 검사 통과, Production 배포
- **보안:** api/ask.ts 삭제 (무인증 엔드포인트 위험), @vercel/node 제거 (CVE 6개 해소), npm audit 0 취약점
- **Analytics:** @vercel/analytics inject() — PR #2 머지 후 재배포 완료
- **Production URL:** https://mirror-vn.vercel.app

## What's next
게임 실제 접속해서 전체 플로우 직접 확인:
- 사운드 재생 여부 (elevator_loop 루프, jumpscare 타이밍)
- 웹캠 손 제스처 → 씬 전환
- 엔딩 진입 (True Ending, Bad Ending)
- 질문 씬에서 "알 수 없다." 표시 확인

## Open decisions
- CSP 헤더 미설정 — MediaPipe가 cdn.jsdelivr.net에서 WASM 로드 (post-launch Medium 이슈)
- True Ending 트랜스크립트 톤 확인 ("의식 성공적으로 종료됨"이 세계관에 맞는지)
- 웹캠 권한 거부 시 에러 핸들링 없음 (silent fail — UX 개선 필요)
- CC BY 라이선스 파일 3개 크레딧 처리 (door_creak, mirror_shatter, jumpscare)

## Context for Claude
- Production URL: https://mirror-vn.vercel.app (Deployment Protection 꺼져 있음, 공개 접근 가능)
- Vercel 프로젝트: yeonheedo1127-4440s-projects/mirror-vn
- GitHub 레포: yhyh6565/cctv-horror-game-fin (main 브랜치)
- Groq API 완전 제거됨 — api/ask.ts 없음, @vercel/node 없음
- Stack: TypeScript, Vite, React, WebRTC webcam API (no Three.js)
- Hand gesture: debounce 300ms minimum
- iOS Safari webcam permission 미테스트
