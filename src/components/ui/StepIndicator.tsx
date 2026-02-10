import { motion } from 'motion/react'

interface StepCounterProps {
  current: number
  total: number
}

export function StepIndicator({ current, total }: StepCounterProps) {
  const progress = current / total

  return (
    <div className="flex items-center gap-2.5">
      {/* Progress bar */}
      <div className="w-16 h-1.5 rounded-full bg-ink/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #7A1B2D, #B83A4A)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-xs font-semibold text-text-muted tracking-wide tabular-nums">
        {current}/{total}
      </span>
    </div>
  )
}
