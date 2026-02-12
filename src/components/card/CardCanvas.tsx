import { forwardRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useCardStore } from '@/stores/cardStore'

interface CardCanvasProps {
  scale?: number
  viewportWidth?: number
}

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂', holiday: '🎉', thank_you: '💐',
  congratulations: '🏆', graduation: '🎓', wedding: '💍',
  new_baby: '👶', get_well: '💝', love: '❤️',
  jewish_holiday: '✡️', ramadan: '🌙', christmas: '🎄',
  new_year: '🎆', mothers_day: '👩', fathers_day: '👨',
  friendship: '🤝', miss_you: '💭', good_luck: '🍀', shabbat_shalom: '🕯️', custom: '✏️',
}

const OCCASION_GRADIENT: Record<string, string> = {
  birthday: 'linear-gradient(135deg, #FFF7F5 0%, #F5ECEB 50%, #FFE8EE 100%)',
  love: 'linear-gradient(135deg, #FFF0F3 0%, #F5E0E5 50%, #FFE5EB 100%)',
  wedding: 'linear-gradient(135deg, #FFFAF9 0%, #F5ECEB 50%, #FFF5F3 100%)',
  christmas: 'linear-gradient(135deg, #F5F0F0 0%, #EDE5E5 50%, #F5EFEF 100%)',
  new_year: 'linear-gradient(135deg, #FFF8F5 0%, #F5ECEA 50%, #FFF5F2 100%)',
  graduation: 'linear-gradient(135deg, #F5EAF0 0%, #EDE0E8 50%, #F0E5ED 100%)',
}

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #FFFAF9 0%, #F5ECEB 50%, #FFF5F3 100%)'

export const CardCanvas = forwardRef<HTMLDivElement, CardCanvasProps>(
  ({ scale = 1, viewportWidth }, ref) => {
    const { t } = useTranslation()
    const backgroundImage = useCardStore((s) => s.backgroundImage)
    const editedMessage = useCardStore((s) => s.editedMessage)
    const occasion = useCardStore((s) => s.occasion)
    const textColor = useCardStore((s) => s.textColor)
    const fontSize = useCardStore((s) => s.fontSize)
    const fontFamily = useCardStore((s) => s.fontFamily)
    const fontWeight = useCardStore((s) => s.fontWeight)
    const fontStyle = useCardStore((s) => s.fontStyle)
    const textPosition = useCardStore((s) => s.textPosition)

    const positionClasses = {
      top: 'justify-start pt-[22%]',
      center: 'justify-center',
      bottom: 'justify-end pb-[22%]',
    }

    const hasContent = backgroundImage || editedMessage
    const gradient = (occasion && OCCASION_GRADIENT[occasion]) || DEFAULT_GRADIENT

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="relative overflow-hidden"
      >
        {/* Empty state — warm gradient with reactive content */}
        {!hasContent && (
          <div
            className="absolute inset-0"
            style={{ background: gradient }}
          >
            {/* Decorative corner elements */}
            <div className="absolute inset-0">
              {/* Top-left corner decoration */}
              <svg
                className="absolute top-[60px] left-[60px] opacity-[0.06]"
                width="200" height="200" viewBox="0 0 200 200" fill="none"
              >
                <path d="M10 100 C10 45, 45 10, 100 10" stroke="#1A0A0E" strokeWidth="3" strokeLinecap="round" />
                <path d="M30 100 C30 55, 55 30, 100 30" stroke="#1A0A0E" strokeWidth="2" strokeLinecap="round" />
                <circle cx="100" cy="10" r="4" fill="#7A1B2D" opacity="0.5" />
              </svg>
              {/* Bottom-right corner decoration */}
              <svg
                className="absolute bottom-[60px] right-[60px] opacity-[0.06] rotate-180"
                width="200" height="200" viewBox="0 0 200 200" fill="none"
              >
                <path d="M10 100 C10 45, 45 10, 100 10" stroke="#1A0A0E" strokeWidth="3" strokeLinecap="round" />
                <path d="M30 100 C30 55, 55 30, 100 30" stroke="#1A0A0E" strokeWidth="2" strokeLinecap="round" />
                <circle cx="100" cy="10" r="4" fill="#9B2335" opacity="0.5" />
              </svg>
              {/* Subtle border frame */}
              <div
                className="absolute inset-[50px] rounded-[20px] opacity-[0.04]"
                style={{ border: '2px solid #1A0A0E' }}
              />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[40px]">
              <AnimatePresence mode="wait">
                {occasion ? (
                  <motion.div
                    key={occasion}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center gap-[30px]"
                  >
                    {/* Emoji with decorative ring */}
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute -inset-[25px] rounded-full opacity-[0.08]"
                        style={{ border: '2px dashed #1A0A0E' }}
                      />
                      <span style={{ fontSize: '120px', lineHeight: 1 }}>
                        {OCCASION_EMOJI[occasion] || '✉️'}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-[20px]"
                  >
                    {/* Envelope illustration */}
                    <svg className="w-[140px] h-[140px] text-ink/[0.08]" viewBox="0 0 100 100" fill="none">
                      <rect x="15" y="25" width="70" height="50" rx="6" stroke="currentColor" strokeWidth="2" />
                      <path d="M15 31 l35 25 l35-25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M15 75 l25-20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M85 75 l-25-20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* "Taking shape" hint */}
              {occasion && !backgroundImage && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.2, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    fontSize: '26px',
                    fontFamily: "'Noto Sans', sans-serif",
                    color: '#1A0A0E',
                    textAlign: 'center',
                    letterSpacing: '0.02em',
                  }}
                >
                  {t('canvas.building', 'Your card is taking shape...')}
                </motion.p>
              )}
            </div>
          </div>
        )}

        {/* Background image with crossfade */}
        <AnimatePresence mode="wait">
          {backgroundImage && (
            <motion.img
              key={backgroundImage.id}
              src={backgroundImage.urls.regular}
              alt=""
              crossOrigin="anonymous"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* Gradient overlay for text readability */}
        {backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />
        )}

        {/* Text overlay — dynamic padding to keep text within visible viewport */}
        <div
          className={`absolute inset-0 flex flex-col items-center ${positionClasses[textPosition]} overflow-hidden`}
          style={{
            paddingLeft: (() => {
              if (!viewportWidth || !scale) return '12%'
              const visibleW = viewportWidth / scale
              const clip = Math.max(0, (1080 - visibleW) / 2)
              return `${clip + 48}px`
            })(),
            paddingRight: (() => {
              if (!viewportWidth || !scale) return '12%'
              const visibleW = viewportWidth / scale
              const clip = Math.max(0, (1080 - visibleW) / 2)
              return `${clip + 48}px`
            })(),
          }}
        >
          <AnimatePresence mode="wait">
            {editedMessage && (
              <motion.p
                key={editedMessage.slice(0, 20)}
                dir="auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  color: backgroundImage ? textColor : '#1A0A0E',
                  fontSize: `${fontSize}px`,
                  fontFamily: `'${fontFamily}', 'Noto Sans Hebrew', 'Noto Sans Arabic', sans-serif`,
                  fontWeight,
                  fontStyle,
                  lineHeight: 1.5,
                  textAlign: 'center',
                  textShadow: backgroundImage
                    ? '0 2px 12px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)'
                    : 'none',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  maxWidth: '100%',
                  whiteSpace: 'pre-line',
                }}
              >
                {editedMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  },
)

CardCanvas.displayName = 'CardCanvas'
