import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useCardStore } from '@/stores/cardStore'

export function WelcomeScreen() {
  const { t } = useTranslation()
  const setMode = useCardStore((s) => s.setMode)

  return (
    <div className="px-6 pb-8 flex flex-col items-center">
      {/* Large hero emoji with soft glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, duration: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
        className="welcome-float relative my-6"
      >
        {/* Soft light glow behind emoji */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-4 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, rgba(255,255,255,0.15), rgba(184,58,74,0.2), rgba(255,255,255,0.1), rgba(155,35,53,0.15), rgba(255,255,255,0.15))',
            filter: 'blur(20px)',
          }}
        />
        <div
          className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <span className="text-5xl">💌</span>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-bold text-white mb-2 text-center leading-tight tracking-tight"
      >
        {t('welcome.greeting')}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-white/50 text-base mb-10 text-center"
      >
        {t('app.tagline')}
      </motion.p>

      <div className="flex flex-col gap-3 w-full">
        {/* Guide me — white 3D card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.97, y: 2 }}
          whileHover={{ y: -3 }}
          onClick={() => setMode('guided')}
          className="tappable-option w-full flex items-center gap-4 p-5 rounded-2xl text-start"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F4F3 100%)',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow:
              '0 2px 4px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.15), 0 20px 48px rgba(92,15,32,0.2), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7A1B2D, #5C0F20)',
              boxShadow: '0 4px 12px rgba(122,27,45,0.3)',
            }}
          >
            <span className="text-2xl">✨</span>
          </div>
          <div>
            <span className="text-base font-bold block" style={{ color: '#1A0A0E' }}>
              {t('welcome.guided')}
            </span>
            <span className="text-sm" style={{ color: '#7A1B2D' }}>
              {t('welcome.guidedDesc')}
            </span>
          </div>
        </motion.button>

        {/* Freeform — frosted glass card with 3D */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.97, y: 2 }}
          whileHover={{ y: -3 }}
          onClick={() => setMode('freeform')}
          className="tappable-option w-full flex items-center gap-4 p-5 rounded-2xl text-start"
          style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow:
              '0 2px 4px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <span className="text-2xl">✍️</span>
          </div>
          <div>
            <span className="text-base font-bold text-white block">
              {t('welcome.freeform')}
            </span>
            <span className="text-sm text-white/50">
              {t('welcome.freeformDesc')}
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  )
}
