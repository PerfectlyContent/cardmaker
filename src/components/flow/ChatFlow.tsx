import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useCardStore } from '@/stores/cardStore'
import { useImageSearch } from '@/hooks/useImageSearch'
import { chatWithAssistant, parseCardReady, type ChatTurn } from '@/lib/openai'
import type { Occasion, CardVibe } from '@/types'

interface Bubble {
  id: string
  role: 'assistant' | 'user'
  text: string
  isTyping?: boolean
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

const VALID_OCCASIONS: Occasion[] = [
  'birthday', 'holiday', 'thank_you', 'congratulations', 'graduation',
  'wedding', 'new_baby', 'get_well', 'love', 'jewish_holiday', 'ramadan',
  'christmas', 'new_year', 'mothers_day', 'fathers_day', 'friendship',
  'miss_you', 'good_luck', 'shabbat_shalom', 'custom',
]

const VALID_VIBES: CardVibe[] = [
  'funny', 'cute', 'heartfelt', 'formal', 'inspiring', 'poetic', 'festive', 'playful',
]

export function ChatFlow() {
  const { t, i18n } = useTranslation()
  const store = useCardStore()
  const { search } = useImageSearch()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const lang = i18n.language?.split('-')[0] || 'en'

  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [history, setHistory] = useState<ChatTurn[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  // Show greeting on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const greeting = getGreeting(lang)
      setBubbles([{ id: 'greeting', role: 'assistant', text: greeting }])
    }, 400)
    return () => clearTimeout(timer)
  }, [lang])

  useEffect(() => {
    scrollToBottom()
  }, [bubbles, scrollToBottom])

  // Focus input
  useEffect(() => {
    if (!isWaiting && !isDone) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isWaiting, isDone, bubbles])

  const handleSubmit = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || isWaiting || isDone) return

    // Add user bubble
    const userBubble: Bubble = { id: `u-${Date.now()}`, role: 'user', text: trimmed }
    setBubbles((prev) => [...prev, userBubble])
    setInputValue('')
    setIsWaiting(true)

    // Show typing indicator
    const typingId = `typing-${Date.now()}`
    setTimeout(() => {
      setBubbles((prev) => [...prev, { id: typingId, role: 'assistant', text: '', isTyping: true }])
    }, 200)

    try {
      const response = await chatWithAssistant(history, trimmed, lang)

      // Check if the AI is ready to create the card
      const cardData = parseCardReady(response)

      // Update history
      const newHistory: ChatTurn[] = [
        ...history,
        { role: 'user', text: trimmed },
        { role: 'model', text: response },
      ]
      setHistory(newHistory)

      if (cardData) {
        // AI has gathered enough — apply to store and move to toolbar
        const occasion = VALID_OCCASIONS.includes(cardData.occasion as Occasion)
          ? (cardData.occasion as Occasion)
          : 'custom'
        // Map the AI's style/tone to a vibe
        const vibeFromStyle = VALID_VIBES.includes(cardData.style as CardVibe)
          ? (cardData.style as CardVibe)
          : null
        const vibeFromTone = VALID_VIBES.includes(cardData.tone as CardVibe)
          ? (cardData.tone as CardVibe)
          : null
        const vibe = vibeFromTone || vibeFromStyle || 'heartfelt'

        store.setOccasion(occasion)
        store.setVibe(vibe)
        store.setRecipientName(cardData.recipient)
        store.setRecipientDetails(cardData.details)
        store.setGeneratedMessage(cardData.message)

        // Search for background images
        search(occasion, vibe)

        // Replace typing with "creating your card" message
        setBubbles((prev) =>
          prev.filter((b) => b.id !== typingId).concat({
            id: 'creating',
            role: 'assistant',
            text: t('chat.generating'),
          }),
        )

        setIsDone(true)

        // Move to share/toolbar step after a brief pause
        setTimeout(() => {
          store.nextStep()
        }, 1200)
      } else {
        // Regular conversation — show AI response
        // Strip the response text (remove any accidental card markers)
        const cleanResponse = response.replace(/---CARD_READY---[\s\S]*---END_CARD---/, '').trim()

        setBubbles((prev) =>
          prev.filter((b) => b.id !== typingId).concat({
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: cleanResponse || response,
          }),
        )
        setIsWaiting(false)
      }
    } catch (err) {
      console.error('Chat error:', err)
      setBubbles((prev) =>
        prev.filter((b) => b.id !== typingId).concat({
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: t('common.error'),
        }),
      )
      setIsWaiting(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ maxHeight: '42vh' }}>
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-[22px] font-bold tracking-tight text-ink mb-0.5">{t('chat.title', "Let's create your card")}</h2>
        <p className="text-[13px] text-text-muted">{t('chat.subtitle', 'Tell me about the card you want to make')}</p>
      </div>

      {/* Scrollable chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-2 space-y-3">
        <AnimatePresence mode="popLayout">
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${bubble.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {bubble.isTyping ? (
                <div className="chat-bubble-assistant">
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="chat-typing-dot" style={{ animationDelay: '0s' }} />
                    <div className="chat-typing-dot" style={{ animationDelay: '0.2s' }} />
                    <div className="chat-typing-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              ) : bubble.role === 'user' ? (
                <div className="chat-bubble-user">
                  <span className="text-sm font-medium">{bubble.text}</span>
                </div>
              ) : (
                <div className="chat-bubble-assistant">
                  <span className="text-sm text-ink/80">{bubble.text}</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input area */}
      {!isDone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-2 pt-2 border-t border-border flex gap-2 items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim() && !isWaiting) {
                handleSubmit(inputValue)
              }
            }}
            placeholder={t('chat.typePlaceholder')}
            disabled={isWaiting}
            className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F5F5] text-sm text-ink focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
            autoFocus
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSubmit(inputValue)}
            disabled={!inputValue.trim() || isWaiting}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40"
            style={{
              background: inputValue.trim() && !isWaiting ? '#000' : '#F5F5F5',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={inputValue.trim() && !isWaiting ? '#fff' : '#999'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
