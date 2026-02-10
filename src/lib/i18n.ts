import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '@/locales/en.json'
import he from '@/locales/he.json'
import ar from '@/locales/ar.json'
import es from '@/locales/es.json'
import fr from '@/locales/fr.json'
import ru from '@/locales/ru.json'

const RTL_LANGUAGES = ['he', 'ar']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
      ar: { translation: ar },
      es: { translation: es },
      fr: { translation: fr },
      ru: { translation: ru },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

// Update document direction on language change
i18n.on('languageChanged', (lng) => {
  const baseLanguage = lng.split('-')[0]
  const dir = RTL_LANGUAGES.includes(baseLanguage) ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = baseLanguage
})

// Set initial direction
const initialLang = i18n.language?.split('-')[0] || 'en'
document.documentElement.dir = RTL_LANGUAGES.includes(initialLang) ? 'rtl' : 'ltr'
document.documentElement.lang = initialLang

export default i18n
export { RTL_LANGUAGES }
