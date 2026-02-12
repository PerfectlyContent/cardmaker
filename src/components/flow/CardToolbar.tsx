import { useState, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useCardStore } from '@/stores/cardStore'
import { generateCardMessage } from '@/lib/openai'
import { buildCardPrompt } from '@/lib/prompts'
import type { TextPosition } from '@/types'

type ToolTab = 'text' | 'font' | 'size' | 'color' | 'position' | 'background'

const FONTS_LATIN = [
  { family: 'DM Sans', label: 'Clean' },
  { family: 'Instrument Serif', label: 'Serif' },
  { family: 'Playfair Display', label: 'Elegant' },
  { family: 'Noto Sans', label: 'Classic' },
  { family: 'Roboto Slab', label: 'Slab' },
  { family: 'Dancing Script', label: 'Script' },
  { family: 'Caveat', label: 'Handwritten' },
  { family: 'Satisfy', label: 'Fancy' },
]

const FONTS_HEBREW = [
  { family: 'Heebo', label: 'נקי' },
  { family: 'Rubik', label: 'מודרני' },
  { family: 'Frank Ruhl Libre', label: 'קלאסי' },
  { family: 'Secular One', label: 'בולט' },
  { family: 'Suez One', label: 'מעוצב' },
  { family: 'Varela Round', label: 'עגול' },
  { family: 'Noto Sans Hebrew', label: 'רגיל' },
]

const RTL_LANGS = ['he', 'ar']

function getFonts(lang: string) {
  const base = lang.split('-')[0]
  if (base === 'he') return FONTS_HEBREW
  // Arabic could get its own set later
  return FONTS_LATIN
}

const COLORS = [
  // Neutrals
  '#FFFFFF', '#F5F5F5', '#D4D4D4', '#9CA3AF',
  '#6B7280', '#374151', '#1F2937', '#000000',
  // Warm
  '#FEF3C7', '#FDE68A', '#FBBF24', '#F59E0B',
  '#FED7AA', '#FDBA74', '#FB923C', '#EA580C',
  '#FECACA', '#FCA5A5', '#F87171', '#DC2626',
  // Cool
  '#DBEAFE', '#93C5FD', '#3B82F6', '#1D4ED8',
  '#E0E7FF', '#A5B4FC', '#818CF8', '#4F46E5',
  '#D5F5F6', '#67E8F9', '#06B6D4', '#0E7490',
  // Nature
  '#D1FAE5', '#6EE7B7', '#10B981', '#047857',
  '#FCE7F3', '#F9A8D4', '#EC4899', '#BE185D',
  // Brand / Wine
  '#7A1B2D', '#9B2335', '#B83A4A', '#D4757F',
]

const TAB_ICONS: Record<ToolTab, JSX.Element> = {
  text: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  ),
  font: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 20l4.5-12h7L20 20M6.5 14h11" />
    </svg>
  ),
  size: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 7V4h8v3M7 4v16M14 14v-3h7v3M17.5 11v9" />
    </svg>
  ),
  color: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  ),
  position: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  ),
  background: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
}

interface CardToolbarProps {
  onDone?: () => void
}

export function CardToolbar({ onDone }: CardToolbarProps) {
  const { t } = useTranslation()
  const store = useCardStore()
  const [activeTab, setActiveTab] = useState<ToolTab>('text')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
        {(Object.keys(TAB_ICONS) as ToolTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`toolbar-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {TAB_ICONS[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'text' && <TextTab />}
          {activeTab === 'font' && <FontTab />}
          {activeTab === 'size' && <SizeTab />}
          {activeTab === 'color' && <ColorTab />}
          {activeTab === 'position' && <PositionTab />}
          {activeTab === 'background' && <BackgroundTab />}
        </motion.div>
      </AnimatePresence>

      {/* Done button — returns to share/preview */}
      {onDone && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          className="w-full mt-4 py-3 rounded-full text-white text-sm font-semibold transition-all"
          style={{ background: '#000' }}
        >
          {t('toolbar.done', 'Done')}
        </motion.button>
      )}
    </div>
  )
}

function TextTab() {
  const { t } = useTranslation()
  const store = useCardStore()
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegenerate = async () => {
    setRegenerating(true)
    setError(null)
    try {
      const prompt = buildCardPrompt({
        occasion: store.occasion,
        recipientType: store.recipientType,
        recipientName: store.recipientName,
        recipientDetails: store.recipientDetails,
        vibe: store.vibe,
        includeQuote: store.includeQuote,
      })
      const message = await generateCardMessage(prompt)
      store.setGeneratedMessage(message)
    } catch (err) {
      console.error('Regenerate failed:', err)
      setError(t('common.error'))
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-text-muted">{t('toolbar.text')}</label>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-1 text-xs font-medium text-terracotta hover:text-terracotta/80 disabled:opacity-40 transition-colors"
        >
          <motion.svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            animate={regenerating ? { rotate: 360 } : {}}
            transition={regenerating ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.3" />
          </motion.svg>
          {t('message.regenerate')}
        </motion.button>
      </div>
      <textarea
        value={store.editedMessage}
        onChange={(e) => store.setEditedMessage(e.target.value)}
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl bg-bg-subtle border border-border-strong text-ink text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/30"
        placeholder={t('chat.typePlaceholder')}
      />
      <p className="text-[10px] text-text-muted mt-1 opacity-60">
        {t('message.edit', 'Use Enter for line breaks')}
      </p>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

function FontTab() {
  const { t, i18n } = useTranslation()
  const fontFamily = useCardStore((s) => s.fontFamily)
  const setFontFamily = useCardStore((s) => s.setFontFamily)
  const setFontWeight = useCardStore((s) => s.setFontWeight)
  const setFontStyle = useCardStore((s) => s.setFontStyle)
  const fonts = getFonts(i18n.language)

  return (
    <div>
      <label className="text-xs font-semibold text-text-muted mb-2 block">{t('toolbar.font')}</label>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {fonts.map((f) => (
          <button
            key={f.family}
            onClick={() => {
              setFontFamily(f.family)
              setFontWeight(400)
              setFontStyle('normal')
            }}
            className={`font-chip ${fontFamily === f.family ? 'active' : ''}`}
            style={{ fontFamily: f.family }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SizeTab() {
  const { t } = useTranslation()
  const fontSize = useCardStore((s) => s.fontSize)
  const setFontSize = useCardStore((s) => s.setFontSize)

  return (
    <div>
      <label className="text-xs font-semibold text-text-muted mb-2 block">{t('toolbar.size')}</label>
      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setFontSize(Math.max(20, fontSize - 2))}
          className="w-10 h-10 rounded-xl bg-bg-subtle border border-border-strong flex items-center justify-center text-ink font-bold"
        >
          −
        </motion.button>
        <span className="text-lg font-semibold text-ink w-10 text-center">{fontSize}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setFontSize(Math.min(60, fontSize + 2))}
          className="w-10 h-10 rounded-xl bg-bg-subtle border border-border-strong flex items-center justify-center text-ink font-bold"
        >
          +
        </motion.button>
      </div>
    </div>
  )
}

function ColorTab() {
  const { t } = useTranslation()
  const textColor = useCardStore((s) => s.textColor)
  const setTextColor = useCardStore((s) => s.setTextColor)

  return (
    <div>
      <label className="text-xs font-semibold text-text-muted mb-2 block">{t('toolbar.color')}</label>
      <div className="flex gap-2 flex-wrap">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setTextColor(color)}
            className={`color-swatch ${textColor === color ? 'active' : ''}`}
            style={{ background: color }}
          />
        ))}
      </div>
    </div>
  )
}

function PositionTab() {
  const { t } = useTranslation()
  const textPosition = useCardStore((s) => s.textPosition)
  const setTextPosition = useCardStore((s) => s.setTextPosition)

  const positions: { id: TextPosition; label: string; icon: JSX.Element }[] = [
    {
      id: 'top',
      label: t('toolbar.top'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="7" y1="8" x2="17" y2="8" />
        </svg>
      ),
    },
    {
      id: 'center',
      label: t('toolbar.center'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="7" y1="12" x2="17" y2="12" />
        </svg>
      ),
    },
    {
      id: 'bottom',
      label: t('toolbar.bottom'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="7" y1="16" x2="17" y2="16" />
        </svg>
      ),
    },
  ]

  return (
    <div>
      <label className="text-xs font-semibold text-text-muted mb-2 block">{t('toolbar.position')}</label>
      <div className="flex gap-2">
        {positions.map((pos) => (
          <motion.button
            key={pos.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => setTextPosition(pos.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              textPosition === pos.id
                ? 'bg-ink text-white'
                : 'bg-bg-subtle border border-border-strong text-ink/60'
            }`}
          >
            {pos.icon}
            {pos.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function BackgroundTab() {
  const { t } = useTranslation()
  const backgroundImages = useCardStore((s) => s.backgroundImages)
  const backgroundIndex = useCardStore((s) => s.backgroundIndex)
  const setBackgroundIndex = useCardStore((s) => s.setBackgroundIndex)
  const setBackgroundImages = useCardStore((s) => s.setBackgroundImages)
  const setBackgroundImage = useCardStore((s) => s.setBackgroundImage)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    const trimmed = prompt.trim()
    if (!trimmed) return
    setGenerating(true)
    try {
      const { generateImage } = await import('@/lib/reve')
      const dataUrl = await generateImage(trimmed)
      const generated = {
        id: `reve-${Date.now()}`,
        urls: { raw: dataUrl, full: dataUrl, regular: dataUrl, small: dataUrl, thumb: dataUrl },
        alt_description: trimmed,
        photographer: 'AI Generated',
        photographerUrl: '',
        width: 1080,
        height: 1080,
      }
      const updated = [generated, ...backgroundImages]
      setBackgroundImages(updated)
      setBackgroundImage(generated)
    } catch (err) {
      console.error('Image generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGenerate()
  }

  return (
    <div>
      <label className="text-xs font-semibold text-text-muted mb-2 block">{t('toolbar.background')}</label>

      {/* AI Generate input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={generating}
          placeholder={t('background.generatePlaceholder', 'e.g. sunset over ocean...')}
          className="flex-1 px-3 py-2 rounded-xl bg-bg-subtle border border-border-strong text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="px-3 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all flex items-center gap-1"
          style={{ background: 'linear-gradient(135deg, #7A1B2D, #5C0F20)' }}
        >
          {generating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
            />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Thumbnails */}
      {backgroundImages.length > 0 ? (
        <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
          {backgroundImages.map((img, i) => (
            <motion.button
              key={img.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setBackgroundIndex(i)}
              className="shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all"
              style={{
                boxShadow: i === backgroundIndex
                  ? '0 0 0 2.5px #7A1B2D, 0 4px 12px rgba(122,27,45,0.25)'
                  : 'none',
                opacity: i === backgroundIndex ? 1 : 0.6,
                border: i === backgroundIndex ? 'none' : '1px solid rgba(122,27,45,0.08)',
              }}
            >
              <img
                src={img.urls.thumb}
                alt={img.alt_description || ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted">{t('style.loading')}</p>
      )}
    </div>
  )
}

