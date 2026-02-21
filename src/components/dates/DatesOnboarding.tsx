import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useDateStore } from '@/stores/dateStore'
import { DateForm } from './DateForm'

interface DatesOnboardingProps {
  onDone: () => void
  onCreateCard: () => void
}

export function DatesOnboarding({ onDone, onCreateCard }: DatesOnboardingProps) {
  const { t } = useTranslation()
  const dates = useDateStore((s) => s.dates)
  const removeDate = useDateStore((s) => s.removeDate)
  const setOnboarded = useDateStore((s) => s.setOnboarded)
  const [step, setStep] = useState<'choose' | 'dates'>('choose')

  const handleDone = () => {
    setOnboarded()
    onDone()
  }

  const handleCreateCard = () => {
    setOnboarded()
    onCreateCard()
  }

  const typeEmoji: Record<string, string> = {
    birthday: '🎂',
    anniversary: '💍',
    holiday: '🎉',
    custom: '📅',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col"
    >
      <div className="absolute inset-0 app-bg" />

      <div className="relative z-10 flex flex-col h-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ─── Step 1: Choose path ─── */}
          {step === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center px-6 pb-8"
            >
              {/* Hero emoji */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05, duration: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
                className="welcome-float relative mb-6"
              >
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

              {/* Welcome text */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-bold text-white mb-2 text-center leading-tight tracking-tight"
              >
                {t('dates.welcomeTitle', 'Welcome!')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-white/50 text-base mb-10 text-center"
              >
                {t('app.tagline')}
              </motion.p>

              {/* Two path options */}
              <div className="flex flex-col gap-3 w-full max-w-md">
                {/* Set up dates — white 3D card */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  whileTap={{ scale: 0.97, y: 2 }}
                  whileHover={{ y: -3 }}
                  onClick={() => setStep('dates')}
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
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <span className="text-base font-bold block" style={{ color: '#1A0A0E' }}>
                      {t('dates.onboardingTitle', 'Never miss a special day')}
                    </span>
                    <span className="text-sm" style={{ color: '#7A1B2D' }}>
                      {t('dates.onboardingSubtitle2', 'Set up birthdays & reminders')}
                    </span>
                  </div>
                </motion.button>

                {/* Create a card — frosted glass */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  whileTap={{ scale: 0.97, y: 2 }}
                  whileHover={{ y: -3 }}
                  onClick={handleCreateCard}
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
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <span className="text-base font-bold text-white block">
                      {t('dates.createCard', 'Create a card')}
                    </span>
                    <span className="text-sm text-white/50">
                      {t('dates.createCardDesc', "I'll set up dates later")}
                    </span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Date form ─── */}
          {step === 'dates' && (
            <motion.div
              key="dates"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {/* Back / Skip */}
              <div className="flex items-center justify-between px-5" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setStep('choose')}
                  className="tappable-option w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" className="rtl:rotate-180">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </motion.button>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDone}
                  className="tappable-option text-white/50 text-sm font-medium px-3 py-1.5"
                >
                  {t('common.skip')}
                </motion.button>
              </div>

              <div className="px-6 pb-8">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <div className="text-4xl mb-3">📅</div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {t('dates.onboardingTitle', 'Never miss a special day')}
                  </h1>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {t('dates.onboardingSubtitle', "Add birthdays, anniversaries & more. We'll remind you to create a card before the day comes.")}
                  </p>
                </motion.div>

                {/* Added dates */}
                <AnimatePresence>
                  {dates.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4 space-y-2"
                    >
                      {dates.map((d) => (
                        <motion.div
                          key={d.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                          <span className="text-lg">{typeEmoji[d.type] || '📅'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">{d.name}</div>
                            <div className="text-white/40 text-xs">
                              {new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                              {d.recurring && ' · ' + t('dates.yearly', 'Yearly')}
                            </div>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeDate(d.id)}
                            className="tappable-option w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.1)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Date form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <DateForm compact />
                </motion.div>

                {/* Done button (only when dates added) */}
                {dates.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDone}
                    className="w-full mt-4 py-3.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #fff, #f0e8e6)',
                      color: '#5C0F20',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }}
                  >
                    {t('common.done')} ({dates.length} {dates.length === 1 ? t('dates.dateAdded', 'date added') : t('dates.datesAdded', 'dates added')})
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
