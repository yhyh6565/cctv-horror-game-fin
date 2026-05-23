export interface GhostChoice {
  text: string
  reaction: string
}

export interface GhostQuestion {
  question: string
  choices: GhostChoice[]
}

export const GHOST_QUESTIONS: GhostQuestion[] = [
  {
    question: '이름이 뭐야?',
    choices: [
      { text: '이름을 적는다', reaction: '손이 떨렸다.' },
      { text: '거짓말을 하려다 멈췄다', reaction: '위험하다. 거짓말은 안 된다.' },
      { text: '침묵한다', reaction: '하지만 침묵도 답이 아닐 것 같았다.' },
    ],
  },
  {
    question: '생일이 언제야?',
    choices: [
      { text: '생일을 적는다', reaction: '귀신이 팔짝팔짝 뛰었다.' },
      { text: '다른 날짜를 적으려 했다', reaction: '…안 된다. 거짓말은 위험해.' },
      { text: '왜 알고 싶어?', reaction: '대답하지 않으면 안 될 것 같았다.' },
    ],
  },
  {
    question: '지금 무서워?',
    choices: [
      { text: '응', reaction: '솔직하게 대답했다.' },
      { text: '아니', reaction: '거짓말이었다.' },
      { text: '너한텐 안 져', reaction: '이제 어떻게 해야 할지 알았다.' },
    ],
  },
]

export function getGhostQuestion(index: number): GhostQuestion | null {
  return GHOST_QUESTIONS[index] ?? null
}
