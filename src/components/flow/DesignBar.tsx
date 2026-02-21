import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useCardStore } from '@/stores/cardStore'

/** Background selection capsule — thumbnail strip */
export function BackgroundBar() {
  const { t } = useTranslation()
  const store = useCardStore()

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-ink mb-0.5">{t('background.title', 'Choose a background')}</h2>
        <p className="text-[13px] text-text-muted">{t('background.hint', 'Swipe left & right on the card above')}</p>
      </div>

      {/* Thumbnail strip */}
      {store.backgroundImages.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1">
          {store.backgroundImages.map((img, i) => (
            <motion.button
              key={img.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => store.setBackgroundIndex(i)}
              className="shrink-0 w-10 h-10 rounded-lg overflow-hidden"
              style={{
                boxShadow: i === store.backgroundIndex ? '0 0 0 2px #7A1B2D' : 'none',
                opacity: i === store.backgroundIndex ? 1 : 0.5,
              }}
            >
              <img src={img.urls.thumb} alt={img.alt_description || ''} className="w-full h-full object-cover" loading="lazy" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Continue */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={store.nextStep}
        className="w-full py-3 rounded-full text-white text-sm font-semibold disabled:opacity-40 transition-all"
        style={{ background: '#000' }}
      >
        {t('common.continue')}
      </motion.button>
    </div>
  )
}

/** Message editing capsule — textarea + regenerate */
export function MessageBar() {
  const { t } = useTranslation()
  const store = useCardStore()
  const [error, setError] = useState<string | null>(null)

  // Auto-generate message on mount
  useEffect(() => {
    const s = useCardStore.getState()
    if (!s.generatedMessage && !s.isGenerating) {
      generateMsg()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateMsg = async () => {
    const s = useCardStore.getState()
    if (s.isGenerating) return
    const { generateCardMessage } = await import('@/lib/openai')
    const { buildCardPrompt } = await import('@/lib/prompts')
    useCardStore.getState().setIsGenerating(true)
    setError(null)
    try {
      const prompt = buildCardPrompt({
        occasion: s.occasion,
        recipientType: s.recipientType,
        recipientName: s.recipientName,
        recipientDetails: s.recipientDetails,
        vibe: s.vibe,
        includeQuote: s.includeQuote,
      })
      const message = await generateCardMessage(prompt)
      useCardStore.getState().setGeneratedMessage(message)
    } catch (err) {
      console.error('Message generation failed:', err)
      setError(t('common.error'))
    } finally {
      useCardStore.getState().setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-ink mb-0.5">{t('message.title', 'Your message')}</h2>
        <p className="text-[13px] text-text-muted">{t('message.subtitle', 'We wrote something for you — edit it or regenerate')}</p>
      </div>

      {store.isGenerating ? (
        <div className="flex items-center gap-2 py-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 rounded-full border-2 border-ink/10 border-t-terracotta"
          />
          <span className="text-text-muted text-xs">{t('message.generating')}</span>
        </div>
      ) : (
        <div className="flex gap-2 items-end">
          <textarea
            value={store.editedMessage}
            onChange={(e) => store.setEditedMessage(e.target.value)}
            rows={3}
            className="flex-1 px-4 py-3 rounded-xl bg-[#F5F5F5] text-ink text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-text-muted"
            placeholder={t('message.freeformPlaceholder')}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={generateMsg}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-terracotta"
            style={{ background: 'rgba(122,27,45,0.08)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.3" />
            </svg>
          </motion.button>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Continue */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={store.nextStep}
        disabled={!store.editedMessage}
        className="w-full py-3 rounded-full text-white text-sm font-semibold disabled:opacity-40 transition-all"
        style={{ background: '#000' }}
      >
        {t('common.continue')}
      </motion.button>
    </div>
  )
}
