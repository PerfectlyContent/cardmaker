import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useCardStore } from '@/stores/cardStore'

interface RevealScreenProps {
  onEdit: () => void
}

export function RevealScreen({ onEdit }: RevealScreenProps) {
  const { t } = useTranslation()
  const nextStep = useCardStore((s) => s.nextStep)

  return (
    <div className="flex gap-3">
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.97 }}
        onClick={onEdit}
        className="flex-1 py-3.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#000',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        {t('toolbar.edit', 'Edit card')}
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.97 }}
        onClick={nextStep}
        className="flex-1 py-3.5 rounded-full text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
        style={{ background: '#000' }}
      >
        {t('preview.looksGood', 'Looks good!')}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </motion.button>
    </div>
  )
}
