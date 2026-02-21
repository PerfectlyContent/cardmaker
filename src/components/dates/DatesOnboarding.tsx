import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useDateStore } from '@/stores/dateStore'
import { DateForm } from './DateForm'

interface DatesOnboardingProps {
  onDone: () => void
}

export function DatesOnboarding({ onDone }: DatesOnboardingProps) {
  const { t } = useTranslation()
  const dates = useDateStore((s) => s.dates)
  const removeDate = useDateStore((s) => s.removeDate)
  const setOnboarded = useDateStore((s) => s.setOnboarded)

  const handleDone = () => {
    setOnboarded()
    onDone()
  }

  const handleSkip = () => {
    setOnboarded()
    onDone()
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
        {/* Skip button */}
        <div className="flex justify-end px-5" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="tappable-option text-white/50 text-sm font-medium px-3 py-1.5"
          >
            {t('common.skip')}
          </motion.button>
        </div>

        <div className="flex-1 px-6 pb-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="text-4xl mb-3">📅</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t('dates.onboardingTitle', 'Never miss an important date')}
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
      </div>
    </motion.div>
  )
}
