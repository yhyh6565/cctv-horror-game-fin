# 거울을 보지 마세요 (Mirror VN)

> 엘리베이터 귀신 가위바위보 의식 — 웹캠 손 인식 기반 호러 비주얼 노벨

괴담 「거울을 보지 마세요」를 원작으로 한 인터랙티브 호러 게임. 실제 손을 카메라에 비춰 귀신과 가위바위보를 하고, 엘리베이터에서 탈출하라.

---

## 플레이 방법

1. 웹캠을 허용하고 화면을 클릭해 시작
2. 거울 속 귀신과 가위바위보 — 손 제스처를 카메라에 보여주면 자동 인식
3. **페이즈 1:** 보를 내면 비김, 바위/가위를 내면 귀신이 가까워짐 (4패 or 5라운드 → 페이즈 2)
4. **페이즈 2:** 가위만 이김. 귀신이 가위를 한 번도 낸 적 없다는 걸 이용하라
5. 탈출 시퀀스: 손바닥으로 유리창 서리 닦기 → 검지 3초 유지

### 손 제스처

| 제스처 | 인식 | 역할 |
|--------|------|------|
| ✊ 바위 | 네 손가락 모두 접기 | RPS |
| 🖐 보 | 네 손가락 모두 펴기 | RPS |
| ✌ 가위 | 검지+중지만 펴기 | RPS / 페이즈 2 정답 |
| ☝ 검지 | 검지만 펴기 | 탈출 열림 버튼 유지 |
| 🖐 손바닥 이동 | 손목 X축 이동 | 서리 닦기 |

> 손이 5초 이상 화면에서 사라지면 점프 스케어 발생

---

## 엔딩

| 엔딩 | 조건 |
|------|------|
| **True Ending** | 탈출 완료 후 유리창에 질문 → 거울 속 존재가 진실 답변 |
| **Bad Ending** | 페이즈 2에서 3패 또는 라운드 3 실패 |
| **Dead Ending** | 페이즈 2 신호 1.5초 내 미응답 |
| **Jump Scare** | 손 5초 소실 |

---

## 기술 스택

- **React 18 + TypeScript + Vite** — 게임 엔진 없이 CSS z-index 레이어만으로 구현
- **MediaPipe Hands** — 실시간 손 제스처 인식 (가위바위보 / 검지 포인팅 / 손바닥 트래킹)
- **Canvas2D** — 서리 닦기 (destination-out 합성)
- **Howler.js** — SFX 12종
- **Groq API (llama-3.3-70b)** — True Ending 자유 질문 응답 (Vercel Serverless 프록시)
- **Tailwind CSS v4** — 스타일링

---

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포 (Vercel)

```bash
vercel --prod
```

Vercel 환경변수 설정 필요:
```
GROQ_API_KEY=your_groq_api_key
```

Groq API 키는 [groq.com](https://groq.com) 에서 무료 발급.

---

## 에셋 준비

`public/images/`와 `public/sounds/`에 에셋이 필요합니다. 이미지는 DALL-E로, 사운드는 ElevenLabs SFX 또는 freesound.org에서 준비.

| 파일 | 설명 |
|------|------|
| `bg_0~4.png` | 엘리베이터 내부 (귀신 접근 단계별) |
| `bg_win_mirror.png` | 거울 파손 씬 |
| `bg_bad_ending.png` | 거울 밖으로 뻗어 나오는 손 |
| `ghost_silhouette.png` | 귀신 실루엣 (투명 PNG) |
| `crack_1~3.png` | 거울 균열 오버레이 3단계 |
| `sounds/*.mp3` | SFX 12종 |

---

*원작: 괴담 「거울을 보지 마세요」*  
*기반 프로젝트: [gottawork](https://github.com/yhyh6565/gottawork)*
