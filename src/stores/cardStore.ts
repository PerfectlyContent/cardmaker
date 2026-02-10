import { create } from 'zustand'
import i18n from '@/lib/i18n'
import type {
  Occasion,
  CardVibe,
  RecipientType,
  TextPosition,
  FlowMode,
  WizardStep,
  BackgroundImage,
  ChatMessage,
  FontConfig,
} from '@/types'

const GUIDED_STEPS: WizardStep[] = [
  'welcome',
  'create',
  'background',
  'message',
  'share',
]

const FREEFORM_STEPS: WizardStep[] = ['welcome', 'chat', 'share']

const VIBE_FONT_LATIN: Record<CardVibe, FontConfig> = {
  funny:       { family: 'Caveat',            weight: 700, style: 'normal' },
  cute:        { family: 'Dancing Script',    weight: 600, style: 'normal' },
  heartfelt:   { family: 'Playfair Display',  weight: 400, style: 'italic' },
  formal:      { family: 'Playfair Display',  weight: 600, style: 'normal' },
  inspiring:   { family: 'Instrument Serif',  weight: 400, style: 'italic' },
  poetic:      { family: 'Satisfy',           weight: 400, style: 'normal' },
  festive:     { family: 'DM Sans',          weight: 700, style: 'normal' },
  playful:     { family: 'Caveat',            weight: 600, style: 'normal' },
}

const VIBE_FONT_HEBREW: Record<CardVibe, FontConfig> = {
  funny:       { family: 'Varela Round',      weight: 400, style: 'normal' },
  cute:        { family: 'Rubik',             weight: 500, style: 'normal' },
  heartfelt:   { family: 'Frank Ruhl Libre',  weight: 400, style: 'normal' },
  formal:      { family: 'Frank Ruhl Libre',  weight: 700, style: 'normal' },
  inspiring:   { family: 'Suez One',          weight: 400, style: 'normal' },
  poetic:      { family: 'Frank Ruhl Libre',  weight: 400, style: 'normal' },
  festive:     { family: 'Secular One',       weight: 400, style: 'normal' },
  playful:     { family: 'Varela Round',      weight: 400, style: 'normal' },
}

export function getVibeFontMap(): Record<CardVibe, FontConfig> {
  const lang = i18n.language?.split('-')[0]
  if (lang === 'he') return VIBE_FONT_HEBREW
  return VIBE_FONT_LATIN
}

interface CardStore {
  // Mode
  mode: FlowMode
  setMode: (mode: FlowMode) => void

  // Navigation
  currentStep: WizardStep
  setStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void
  direction: 1 | -1
  steps: () => WizardStep[]
  stepIndex: () => number

  // Wizard inputs
  occasion: Occasion | null
  setOccasion: (occasion: Occasion) => void

  recipientType: RecipientType
  setRecipientType: (type: RecipientType) => void

  recipientName: string
  setRecipientName: (name: string) => void

  recipientDetails: string
  setRecipientDetails: (details: string) => void

  vibe: CardVibe | null
  setVibe: (vibe: CardVibe) => void

  /** @deprecated — use vibe */
  style: CardVibe | null
  /** @deprecated — use setVibe */
  setStyle: (style: CardVibe) => void
  /** @deprecated — use vibe */
  tone: CardVibe | null
  /** @deprecated — use setVibe */
  setTone: (tone: CardVibe) => void

  includeQuote: boolean
  setIncludeQuote: (include: boolean) => void

  // Free-form
  freeFormPrompt: string
  setFreeFormPrompt: (prompt: string) => void

  // Generated content
  generatedMessage: string
  setGeneratedMessage: (message: string) => void
  editedMessage: string
  setEditedMessage: (message: string) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void

  // Visual
  backgroundImage: BackgroundImage | null
  setBackgroundImage: (image: BackgroundImage | null) => void
  backgroundImages: BackgroundImage[]
  setBackgroundImages: (images: BackgroundImage[]) => void
  backgroundIndex: number
  setBackgroundIndex: (index: number) => void
  isLoadingImages: boolean
  setIsLoadingImages: (loading: boolean) => void

  textColor: string
  setTextColor: (color: string) => void
  fontSize: number
  setFontSize: (size: number) => void
  fontFamily: string
  setFontFamily: (font: string) => void
  fontWeight: number
  setFontWeight: (weight: number) => void
  fontStyle: 'normal' | 'italic'
  setFontStyle: (style: 'normal' | 'italic') => void
  textPosition: TextPosition
  setTextPosition: (position: TextPosition) => void

  // Chat
  chatMessages: ChatMessage[]
  addChatMessage: (msg: ChatMessage) => void
  setChatMessages: (msgs: ChatMessage[]) => void

  // Export
  exportedBlob: Blob | null
  setExportedBlob: (blob: Blob | null) => void

  // Reset
  reset: () => void
}

const initialState = {
  mode: 'guided' as FlowMode,
  currentStep: 'welcome' as WizardStep,
  direction: 1 as 1 | -1,
  occasion: null as Occasion | null,
  recipientType: 'one' as RecipientType,
  recipientName: '',
  recipientDetails: '',
  vibe: null as CardVibe | null,
  style: null as CardVibe | null,
  tone: null as CardVibe | null,
  includeQuote: true,
  freeFormPrompt: '',
  generatedMessage: '',
  editedMessage: '',
  isGenerating: false,
  backgroundImage: null as BackgroundImage | null,
  backgroundImages: [] as BackgroundImage[],
  backgroundIndex: 0,
  isLoadingImages: false,
  textColor: '#FFFFFF',
  fontSize: 32,
  fontFamily: 'Noto Sans',
  fontWeight: 400,
  fontStyle: 'normal' as 'normal' | 'italic',
  textPosition: 'center' as TextPosition,
  chatMessages: [] as ChatMessage[],
  exportedBlob: null as Blob | null,
}

export const useCardStore = create<CardStore>((set, get) => ({
  ...initialState,

  setMode: (mode) => {
    const firstStep = mode === 'guided' ? 'create' : 'chat'
    set({ mode, currentStep: firstStep, direction: 1 })
  },

  setStep: (step) => set({ currentStep: step }),

  steps: () => {
    const { mode } = get()
    return mode === 'guided' ? GUIDED_STEPS : FREEFORM_STEPS
  },

  stepIndex: () => {
    const { mode, currentStep } = get()
    const steps = mode === 'guided' ? GUIDED_STEPS : FREEFORM_STEPS
    return steps.indexOf(currentStep)
  },

  nextStep: () => {
    const { mode, currentStep } = get()
    const steps = mode === 'guided' ? GUIDED_STEPS : FREEFORM_STEPS
    const idx = steps.indexOf(currentStep)
    if (idx < steps.length - 1) {
      const next = steps[idx + 1]
      set({ currentStep: next, direction: 1 })
    }
  },

  prevStep: () => {
    const { mode, currentStep } = get()
    const steps = mode === 'guided' ? GUIDED_STEPS : FREEFORM_STEPS
    const idx = steps.indexOf(currentStep)
    if (idx > 0) {
      const prev = steps[idx - 1]
      set({ currentStep: prev, direction: -1 })
    }
  },

  setOccasion: (occasion) => set({ occasion }),
  setRecipientType: (recipientType) => set({ recipientType }),
  setRecipientName: (recipientName) => set({ recipientName }),
  setRecipientDetails: (recipientDetails) => set({ recipientDetails }),
  setVibe: (vibe) => {
    const fontMap = getVibeFontMap()
    const font = fontMap[vibe]
    set({
      vibe,
      style: vibe,
      tone: vibe,
      fontFamily: font.family,
      fontWeight: font.weight,
      fontStyle: font.style,
    })
  },
  // Deprecated aliases
  setStyle: (style) => get().setVibe(style),
  setTone: (tone) => get().setVibe(tone),
  setIncludeQuote: (includeQuote) => set({ includeQuote }),
  setFreeFormPrompt: (freeFormPrompt) => set({ freeFormPrompt }),
  setGeneratedMessage: (generatedMessage) =>
    set({ generatedMessage, editedMessage: generatedMessage }),
  setEditedMessage: (editedMessage) => set({ editedMessage }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setBackgroundImage: (backgroundImage) => set({ backgroundImage }),
  setBackgroundImages: (backgroundImages) =>
    set({
      backgroundImages,
      backgroundIndex: 0,
      backgroundImage: backgroundImages.length > 0 ? backgroundImages[0] : null,
    }),
  setBackgroundIndex: (backgroundIndex) => {
    const { backgroundImages } = get()
    if (backgroundImages.length > 0) {
      const clamped = Math.max(0, Math.min(backgroundIndex, backgroundImages.length - 1))
      set({ backgroundIndex: clamped, backgroundImage: backgroundImages[clamped] })
    }
  },
  setIsLoadingImages: (isLoadingImages) => set({ isLoadingImages }),
  setTextColor: (textColor) => set({ textColor }),
  setFontSize: (fontSize) => set({ fontSize }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontWeight: (fontWeight) => set({ fontWeight }),
  setFontStyle: (fontStyle) => set({ fontStyle }),
  setTextPosition: (textPosition) => set({ textPosition }),

  chatMessages: [],
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  setChatMessages: (chatMessages) => set({ chatMessages }),

  setExportedBlob: (exportedBlob) => set({ exportedBlob }),

  reset: () => set(initialState),
}))
