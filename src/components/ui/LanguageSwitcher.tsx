import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'he', label: 'HE' },
  { code: 'ar', label: 'AR' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
  { code: 'ru', label: 'RU' },
]

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const currentLang = i18n.language?.split('-')[0] || 'en'
  const currentLabel = LANGUAGES.find((l) => l.code === currentLang)?.label || 'EN'

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider text-text-muted hover:text-ink hover:bg-ink/5 transition-colors uppercase"
        aria-label={t('language.label')}
      >
        {currentLabel}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-10 end-0 z-50 paper rounded-xl p-1.5 min-w-[150px]"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    currentLang === lang.code
                      ? 'bg-ink/6 text-ink font-medium'
                      : 'text-text-muted hover:text-ink hover:bg-ink/4'
                  }`}
                >
                  <span>{t(`language.${lang.code}`)}</span>
                  <span className="text-xs tracking-wider opacity-40 uppercase">{lang.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
