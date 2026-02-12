const API_BASE = import.meta.env.VITE_API_BASE || ''

const SYSTEM_INSTRUCTION =
  'You are a greeting card writer. Write warm, heartfelt, and creative messages for greeting cards. Keep messages concise (30-50 words max). Do not include quotation marks around the message. Do not add any explanation or metadata — just the card message itself.'

async function callGemini(contents: unknown[], generationConfig: unknown): Promise<string> {
  const response = await fetch(`${API_BASE}/api/gemini/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `API error: ${response.status}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
}

export async function generateCardMessage(prompt: string): Promise<string> {
  return callGemini(
    [{ role: 'user', parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${prompt}` }] }],
    { temperature: 0.8, maxOutputTokens: 150 },
  )
}

// --- Multi-turn chat for the freeform conversational flow ---

export interface ChatTurn {
  role: 'user' | 'model'
  text: string
}

const CHAT_SYSTEM_PROMPT = `You are a friendly greeting card assistant helping someone create the perfect greeting card. Your job is to have a natural, brief conversation to understand what they need, then produce the final card content.

RULES:
- Ask short, warm, conversational questions — one at a time
- Keep your messages under 25 words
- You need to find out: who the card is for, what the occasion is, what tone/mood they want, and any personal details
- After you have enough info (usually 3-5 exchanges), tell the user you're ready and produce the card
- When ready, respond with EXACTLY this format — no other text before or after:

---CARD_READY---
occasion: <one of: birthday, holiday, thank_you, congratulations, graduation, wedding, new_baby, get_well, love, jewish_holiday, ramadan, christmas, new_year, mothers_day, fathers_day, friendship, miss_you, good_luck, custom>
style: <one of: cute, elegant, minimalist, bold, festive, floral, abstract, vintage, modern, playful>
tone: <one of: heartfelt, funny, formal, casual, poetic, inspirational>
recipient: <name or description>
details: <any personal details gathered>
message: <the final greeting card message, 20-50 words>
---END_CARD---

- IMPORTANT: Only output the ---CARD_READY--- block when you have gathered enough information
- The message should be written in the SAME LANGUAGE the user is chatting in
- Do NOT ask more than 5 questions total — gather info efficiently
- Be warm and enthusiastic but concise`

export async function chatWithAssistant(
  history: ChatTurn[],
  userMessage: string,
  lang: string,
): Promise<string> {
  const contents = [
    {
      role: 'user' as const,
      parts: [{ text: `${CHAT_SYSTEM_PROMPT}\n\nThe user's language is: ${lang}. Respond in the same language the user writes in.\n\nUser: ${history.length === 0 ? 'Hi, I want to create a greeting card.' : ''}` }],
    },
    {
      role: 'model' as const,
      parts: [{ text: history.length === 0 ? getGreeting(lang) : 'OK' }],
    },
    ...history.flatMap((turn) => [{
      role: turn.role as 'user' | 'model',
      parts: [{ text: turn.text }],
    }]),
    {
      role: 'user' as const,
      parts: [{ text: userMessage }],
    },
  ]

  return callGemini(contents, { temperature: 0.7, maxOutputTokens: 500 })
}

function getGreeting(lang: string): string {
  const greetings: Record<string, string> = {
    en: "Hey! I'd love to help you create a greeting card. Who is it for?",
    he: 'היי! אשמח לעזור לך ליצור כרטיס ברכה. למי הכרטיס?',
    ar: 'مرحبا! يسعدني مساعدتك في إنشاء بطاقة تهنئة. لمن البطاقة؟',
    es: '¡Hola! Me encantaría ayudarte a crear una tarjeta. ¿Para quién es?',
    fr: 'Salut ! Je serais ravi de vous aider à créer une carte. Pour qui est-elle ?',
    ru: 'Привет! Буду рад помочь создать открытку. Для кого она?',
  }
  return greetings[lang] || greetings.en
}

export function parseCardReady(response: string): {
  occasion: string
  style: string
  tone: string
  recipient: string
  details: string
  message: string
} | null {
  const match = response.match(/---CARD_READY---([\s\S]*?)---END_CARD---/)
  if (!match) return null

  const block = match[1]
  const get = (key: string): string => {
    const m = block.match(new RegExp(`${key}:\\s*(.+)`))
    return m ? m[1].trim() : ''
  }

  return {
    occasion: get('occasion'),
    style: get('style'),
    tone: get('tone'),
    recipient: get('recipient'),
    details: get('details'),
    message: get('message'),
  }
}
