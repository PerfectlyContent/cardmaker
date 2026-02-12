export interface BackgroundImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  photographer: string
  photographerUrl: string
  width: number
  height: number
}

export type Occasion =
  | 'birthday'
  | 'holiday'
  | 'thank_you'
  | 'congratulations'
  | 'graduation'
  | 'wedding'
  | 'new_baby'
  | 'get_well'
  | 'love'
  | 'jewish_holiday'
  | 'ramadan'
  | 'christmas'
  | 'new_year'
  | 'mothers_day'
  | 'fathers_day'
  | 'friendship'
  | 'miss_you'
  | 'good_luck'
  | 'shabbat_shalom'
  | 'custom'

export type CardVibe =
  | 'funny'
  | 'cute'
  | 'heartfelt'
  | 'formal'
  | 'inspiring'
  | 'poetic'
  | 'festive'
  | 'playful'

/** @deprecated Use CardVibe instead */
export type CardStyle = CardVibe
/** @deprecated Use CardVibe instead */
export type Tone = CardVibe

export type RecipientType = 'one' | 'many'
export type TextPosition = 'center' | 'top' | 'bottom'
export type FlowMode = 'guided' | 'freeform'

export type WizardStep =
  | 'welcome'
  | 'chat'
  | 'create'
  | 'background'
  | 'message'
  | 'preview'
  | 'share'

export type ChatField =
  | 'recipient'
  | 'occasion'
  | 'vibe'
  | 'includeQuote'
  | 'recipientDetails'

export interface ChatOption {
  id: string
  labelKey: string
  emoji?: string
}

export interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  type: 'text' | 'options' | 'chips' | 'input' | 'generating' | 'complete'
  text?: string
  translationKey?: string
  options?: ChatOption[]
  inputPlaceholderKey?: string
  value?: string
  field?: ChatField
  skippable?: boolean
}

export interface FontConfig {
  family: string
  weight: number
  style: 'normal' | 'italic'
}

export interface CardData {
  mode: FlowMode
  occasion: Occasion | null
  recipientType: RecipientType
  recipientName: string
  recipientDetails: string
  vibe: CardVibe | null
  includeQuote: boolean
  freeFormPrompt: string
  generatedMessage: string
  editedMessage: string
  backgroundImage: BackgroundImage | null
  textColor: string
  fontSize: number
  fontFamily: string
  textPosition: TextPosition
}

export interface OccasionOption {
  id: Occasion
  emoji: string
  labelKey: string
}

export interface VibeOption {
  id: CardVibe
  emoji: string
  labelKey: string
}
