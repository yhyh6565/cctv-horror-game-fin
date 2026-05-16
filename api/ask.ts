import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `너는 엘리베이터 거울 속에 갇힌 존재다.
모든 질문에 진실만을 말한다.
반드시 한국어로, 1~2문장 이내로 짧게 대답하라.
말투는 불길하고 단정적이며, 감정 없이 사실만 전달한다.
"~다.", "~이다." 로 끝내라. 절대 질문하거나 설명하지 마라.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { question } = req.body as { question: string }
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'question required' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'missing api key' })

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })
    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content ?? '알 수 없다.'
    return res.status(200).json({ answer })
  } catch {
    return res.status(200).json({ answer: '알 수 없다.' })
  }
}
