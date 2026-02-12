import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useCardStore } from '@/stores/cardStore'
import { useImageSearch } from '@/hooks/useImageSearch'
import type { Occasion, CardVibe, RecipientType } from '@/types'

type CreateState = 'occasion' | 'recipient' | 'details' | 'vibe'

const OCCASIONS_BASE: { id: Occasion; emoji: string }[] = [
  { id: 'birthday', emoji: '🎂' },
  { id: 'holiday', emoji: '🎉' },
  { id: 'thank_you', emoji: '💐' },
  { id: 'congratulations', emoji: '🏆' },
  { id: 'graduation', emoji: '🎓' },
  { id: 'wedding', emoji: '💍' },
  { id: 'new_baby', emoji: '👶' },
  { id: 'get_well', emoji: '💝' },
  { id: 'love', emoji: '❤️' },
  { id: 'jewish_holiday', emoji: '✡️' },
  { id: 'ramadan', emoji: '🌙' },
  { id: 'christmas', emoji: '🎄' },
  { id: 'new_year', emoji: '🎆' },
  { id: 'mothers_day', emoji: '👩' },
  { id: 'fathers_day', emoji: '👨' },
  { id: 'friendship', emoji: '🤝' },
  { id: 'miss_you', emoji: '💭' },
  { id: 'good_luck', emoji: '🍀' },
]

// Hebrew-only occasions inserted before "custom"
const HEBREW_ONLY_OCCASIONS: { id: Occasion; emoji: string }[] = [
  { id: 'shabbat_shalom', emoji: '🕯️' },
]

function getOccasions(lang: string) {
  const base = [...OCCASIONS_BASE]
  if (lang === 'he') base.push(...HEBREW_ONLY_OCCASIONS)
  base.push({ id: 'custom', emoji: '✏️' })
  return base
}

const VIBES: { id: CardVibe; emoji: string }[] = [
  { id: 'funny', emoji: '😂' },
  { id: 'cute', emoji: '🥰' },
  { id: 'heartfelt', emoji: '💗' },
  { id: 'formal', emoji: '🎩' },
  { id: 'inspiring', emoji: '✨' },
  { id: 'poetic', emoji: '🪶' },
  { id: 'festive', emoji: '🎊' },
  { id: 'playful', emoji: '🎈' },
]

export function CreateFlow() {
  const { t, i18n } = useTranslation()
  const store = useCardStore()
  const { search } = useImageSearch()
  const [phase, setPhase] = useState<CreateState>('occasion')
  const lang = i18n.language?.split('-')[0] || 'en'
  const [nameValue, setNameValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const goBack = () => {
    const order: CreateState[] = ['occasion', 'recipient', 'details', 'vibe']
    const idx = order.indexOf(phase)
    if (idx > 0) {
      setPhase(order[idx - 1])
    } else {
      store.prevStep()
    }
  }

  const handleOccasion = (id: Occasion) => {
    store.setOccasion(id)
    setPhase('recipient')
  }

  const handleRecipient = (type: RecipientType) => {
    store.setRecipientType(type)
    setPhase('details')
    setTimeout(() => inputRef.current?.focus(), 200)
  }

  const handleDetailsNext = () => {
    store.setRecipientName(nameValue.trim())
    setPhase('vibe')
  }

  const handleDetailsSkip = () => {
    setPhase('vibe')
  }

  const handleVibe = (id: CardVibe) => {
    store.setVibe(id)
    search(store.occasion, id)
    store.nextStep()
  }

  return (
    <div>
      {/* Back button — only show if not on occasion */}
      {phase !== 'occasion' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          className="tappable-option text-text-muted mb-3 text-sm font-medium flex items-center gap-1"
        >
          <span className="rtl:rotate-180 inline-block text-xs">←</span>
          {t('common.back')}
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {phase === 'occasion' && (
          <motion.div
            key="occasion"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-[22px] font-bold tracking-tight text-ink mb-0.5">{t('occasion.title')}</h2>
            <p className="text-[13px] text-text-muted mb-4">{t('occasion.subtitle', 'Pick one to get started')}</p>
            <div className="flex gap-2 flex-wrap">
              {getOccasions(lang).map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOccasion(item.id)}
                  className="tappable-option shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all"
                  style={{
                    background: store.occasion === item.id
                      ? '#000'
                      : '#F5F5F5',
                    color: store.occasion === item.id ? '#fff' : '#1A1A1A',
                  }}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span className="whitespace-nowrap">{t(`occasion.${item.id}`)}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'recipient' && (
          <motion.div
            key="recipient"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-[22px] font-bold tracking-tight text-ink mb-0.5">{t('recipient.title')}</h2>
            <p className="text-[13px] text-text-muted mb-4">{t('recipient.subtitle', 'Is this card for one person or a group?')}</p>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleRecipient('one')}
                className="tappable-option flex-1 py-4 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: '#000',
                  color: '#fff',
                }}
              >
                👤 {t('recipient.one')}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleRecipient('many')}
                className="tappable-option flex-1 py-4 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: '#F5F5F5',
                  color: '#1A1A1A',
                }}
              >
                👥 {t('recipient.many')}
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-[22px] font-bold tracking-tight text-ink mb-0.5">{t('details.title', 'Who is it for?')}</h2>
            <p className="text-[13px] text-text-muted mb-4">{t('details.subtitle', 'Add a name to personalize the card')}</p>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nameValue.trim()) handleDetailsNext()
                }}
                placeholder={
                  store.recipientType === 'one'
                    ? t('details.namePlaceholder')
                    : t('details.groupPlaceholder')
                }
                className="flex-1 px-4 py-3 rounded-xl bg-[#F5F5F5] text-ink text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-black/10"
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDetailsSkip}
                className="text-sm font-medium text-text-muted px-3 py-2"
              >
                {t('common.skip')}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDetailsNext}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: nameValue.trim() ? '#000' : '#F5F5F5',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={nameValue.trim() ? '#fff' : '#999'} strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'vibe' && (
          <motion.div
            key="vibe"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-[22px] font-bold tracking-tight text-ink mb-0.5">{t('vibe.title')}</h2>
            <p className="text-[13px] text-text-muted mb-4">{t('vibe.subtitle', 'What mood should your card have?')}</p>
            <div className="flex gap-2 flex-wrap">
              {VIBES.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVibe(item.id)}
                  className="tappable-option shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all"
                  style={{
                    background: store.vibe === item.id ? '#000' : '#F5F5F5',
                    color: store.vibe === item.id ? '#fff' : '#1A1A1A',
                  }}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span className="whitespace-nowrap">{t(`vibe.${item.id}`)}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
