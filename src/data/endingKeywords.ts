const KEYWORD_MAP: Array<{ keywords: string[]; answer: string }> = [
  { keywords: ['돌아가', '집', '원래 세계', '본래'], answer: '돌아갈 수 있다. 반드시.' },
  { keywords: ['살 수 있', '죽', '살아남'], answer: '살 수 있다.' },
  { keywords: ['브라운', '강아지'], answer: '잘 있다.' },
]

export function matchKeyword(question: string): string | null {
  for (const { keywords, answer } of KEYWORD_MAP) {
    if (keywords.some(k => question.includes(k))) return answer
  }
  return null
}
