import { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { motion, type PanInfo } from 'motion/react'
import { useCardStore } from '@/stores/cardStore'
import { useRTL } from '@/hooks/useRTL'
import { CardCanvas } from './CardCanvas'

interface CardCanvasLiveProps {
  /** When true, fits within parent container instead of covering viewport */
  compact?: boolean
}

export function CardCanvasLive({ compact }: CardCanvasLiveProps) {
  const backgroundImages = useCardStore((s) => s.backgroundImages)
  const backgroundIndex = useCardStore((s) => s.backgroundIndex)
  const setBackgroundIndex = useCardStore((s) => s.setBackgroundIndex)
  const currentStep = useCardStore((s) => s.currentStep)
  const isRTL = useRTL()
  const containerRef = useRef<HTMLDivElement>(null)

  const canSwipe = backgroundImages.length > 1 && (currentStep === 'background' || currentStep === 'message' || currentStep === 'share')

  const handleSwipeEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (!canSwipe) return
      const threshold = 50
      const dir = isRTL ? -1 : 1
      if (info.offset.x * dir < -threshold || info.velocity.x * dir < -200) {
        setBackgroundIndex(backgroundIndex + 1)
      } else if (info.offset.x * dir > threshold || info.velocity.x * dir > 200) {
        setBackgroundIndex(backgroundIndex - 1)
      }
    },
    [canSwipe, isRTL, backgroundIndex, setBackgroundIndex],
  )

  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    if (compact && containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setSize({ w: entry.contentRect.width, h: entry.contentRect.height })
        }
      })
      observer.observe(containerRef.current)
      // Initial measurement
      const rect = containerRef.current.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
      return () => observer.disconnect()
    } else {
      const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }
  }, [compact])

  // In compact mode: fit within container. In full mode: cover viewport.
  const scale = compact
    ? Math.min(size.w / 1080, size.h / 1080)
    : Math.max(size.w / 1080, size.h / 1080)

  const isComplete = currentStep === 'share'

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
      dir="ltr"
      style={{ background: compact ? '#F7F7F7' : '#F5ECEB' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 1080 * scale,
          height: 1080 * scale,
          overflow: 'hidden',
          flexShrink: 0,
        }}
        className={isComplete && !compact ? 'card-complete-glow' : ''}
        drag={canSwipe ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleSwipeEnd}
        dragDirectionLock
      >
        <CardCanvas scale={scale} viewportWidth={size.w} />
      </motion.div>

      {/* Confetti burst on share step (full mode only) */}
      {isComplete && !compact && <Confetti />}
    </div>
  )
}

function Confetti() {
  const particles = useMemo(() => {
    const colors = ['#7A1B2D', '#B83A4A', '#9B2335', '#D4757F', '#5C0F20']
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${10 + Math.random() * 80}%`,
      delay: Math.random() * 0.8,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
    }))
  }, [])

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </>
  )
}
