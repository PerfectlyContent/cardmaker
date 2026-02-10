import type { CardVibe, Occasion } from '@/types'
import i18n from 'i18next'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  he: 'Hebrew',
  ar: 'Arabic',
  es: 'Spanish',
  fr: 'French',
  ru: 'Russian',
}

const OCCASION_CONTEXT: Record<Occasion, string> = {
  birthday: 'birthday celebration',
  holiday: 'holiday greeting',
  thank_you: 'thank you note',
  congratulations: 'congratulatory message',
  graduation: 'graduation celebration',
  wedding: 'wedding congratulations',
  new_baby: 'new baby congratulations',
  get_well: 'get well soon wishes',
  love: 'love and affection',
  jewish_holiday: 'Jewish holiday greeting',
  ramadan: 'Ramadan greeting',
  christmas: 'Christmas greeting',
  new_year: 'New Year wishes',
  mothers_day: "Mother's Day celebration",
  fathers_day: "Father's Day celebration",
  friendship: 'friendship appreciation',
  miss_you: 'missing someone',
  good_luck: 'good luck wishes',
  shabbat_shalom: 'Shabbat Shalom greeting for the Jewish Sabbath',
  custom: 'personal greeting',
}

const VIBE_TONE: Record<CardVibe, string> = {
  funny: 'humorous, witty, and lighthearted — make the reader laugh',
  cute: 'warm, sweet, adorable, and lighthearted',
  heartfelt: 'warm, sincere, deeply emotional, and touching',
  formal: 'polished, respectful, elegant, and professional',
  inspiring: 'uplifting, motivational, encouraging, and powerful',
  poetic: 'lyrical, metaphorical, beautifully expressive, and flowing',
  festive: 'celebratory, joyful, exciting, and energetic',
  playful: 'fun, quirky, cheerful, and full of energy',
}

interface PromptInput {
  occasion: Occasion | null
  recipientType: 'one' | 'many'
  recipientName: string
  recipientDetails: string
  vibe: CardVibe | null
  /** @deprecated use vibe */
  style?: CardVibe | null
  /** @deprecated use vibe */
  tone?: CardVibe | null
  includeQuote: boolean
}

export function buildCardPrompt(input: PromptInput): string {
  const lang = LANGUAGE_NAMES[i18n.language?.split('-')[0]] || 'English'
  const parts: string[] = []

  // Occasion
  if (input.occasion) {
    parts.push(`Write a ${OCCASION_CONTEXT[input.occasion]} message`)
  } else {
    parts.push('Write a greeting card message')
  }

  // Recipient
  if (input.recipientType === 'one' && input.recipientName) {
    parts.push(`for ${input.recipientName}`)
  } else if (input.recipientType === 'many') {
    if (input.recipientName) {
      parts.push(`for ${input.recipientName}`)
    } else {
      parts.push('for a group of people')
    }
  }

  // Personal details
  if (input.recipientDetails) {
    parts.push(`(${input.recipientDetails})`)
  }

  // Vibe (unified tone/style)
  const vibe = input.vibe || input.tone || input.style
  if (vibe) {
    parts.push(`. The tone should be ${VIBE_TONE[vibe]}`)
  }

  // Quote
  if (input.includeQuote) {
    parts.push('. You may include a short inspiring quote if it fits naturally')
  }

  // Language
  parts.push(`. Write the entire message in ${lang}`)

  // Constraints
  parts.push('. Keep it between 20-45 words. Make it personal and heartfelt.')

  return parts.join('')
}

export function buildFreeFormPrompt(userPrompt: string): string {
  const lang = LANGUAGE_NAMES[i18n.language?.split('-')[0]] || 'English'
  return `Based on this description, write a greeting card message: "${userPrompt}". Write in ${lang}. Keep it between 20-45 words. Make it personal and heartfelt. Only output the card message text, nothing else.`
}

/** Maps vibe + occasion to a Pexels-friendly image search query */
export function buildImageSearchQuery(
  occasion: Occasion | null,
  vibe: CardVibe | null,
): string {
  // Vibe drives the visual aesthetic of the background
  const vibeQuery: Record<CardVibe, string> = {
    funny: 'colorful fun bright pattern background',
    cute: 'pastel soft color gradient kawaii background',
    heartfelt: 'warm golden sunset soft bokeh background',
    formal: 'gold marble luxury elegant texture background',
    inspiring: 'sunrise mountain landscape epic nature background',
    poetic: 'flowers botanical watercolor soft background',
    festive: 'confetti party celebration glitter texture background',
    playful: 'colorful whimsical fun pattern abstract background',
  }

  // Occasion adds a subtle visual hint
  const occasionHint: Partial<Record<Occasion, string>> = {
    birthday: 'celebration',
    wedding: 'romantic',
    love: 'romantic',
    christmas: 'winter',
    new_baby: 'soft',
    get_well: 'nature',
    ramadan: 'lantern',
    jewish_holiday: 'golden',
    shabbat_shalom: 'candles warm golden',
    new_year: 'sparkle',
  }

  if (vibe) {
    const hint = occasion && occasionHint[occasion] ? ` ${occasionHint[occasion]}` : ''
    return vibeQuery[vibe] + hint
  }

  if (occasion) {
    const hint = occasionHint[occasion] || occasion.replace('_', ' ')
    return `${hint} greeting card background`
  }

  return 'greeting card background texture'
}
