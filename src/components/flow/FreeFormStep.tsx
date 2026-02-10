import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { useCardStore } from '@/stores/cardStore'
import { generateCardMessage } from '@/lib/openai'
import { buildFreeFormPrompt } from '@/lib/prompts'

export function FreeFormStep() {
  const { t } = useTranslation()
  const store = useCardStore()
  const [localPrompt, setLocalPrompt] = useState(store.freeFormPrompt)

  const handleGenerate = async () => {
    if (!localPrompt.trim()) return

    store.setFreeFormPrompt(localPrompt)
    store.setIsGenerating(true)

    try {
      const prompt = buildFreeFormPrompt(localPrompt)
      const message = await generateCardMessage(prompt)
      store.setGeneratedMessage(message)
      store.nextStep()
    } catch (err) {
      console.error('Failed to generate:', err)
    } finally {
      store.setIsGenerating(false)
    }
  }

  return (
    <div className="px-6 pb-6">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-bold text-ink mb-1"
      >
        {t('message.freeformTitle')}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-text-muted text-sm mb-4"
      >
        {t('message.freeformSubtitle', 'Tell me everything — I\'ll handle the rest')}
      </motion.p>

      <motion.textarea
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        value={localPrompt}
        onChange={(e) => setLocalPrompt(e.target.value)}
        placeholder={t('message.freeformPlaceholder')}
        rows={5}
        className="w-full px-4 py-3.5 rounded-xl bg-bg-subtle border border-border-strong text-ink placeholder:text-ink/25 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta/30 resize-none text-base leading-relaxed mb-4"
        autoFocus
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!localPrompt.trim() || store.isGenerating}
          loading={store.isGenerating}
          onClick={handleGenerate}
        >
          {t('message.generate')}
        </Button>
      </motion.div>
    </div>
  )
}
