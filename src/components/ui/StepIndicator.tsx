import { motion } from 'motion/react'

interface StepCounterProps {
  current: number
  total: number
}

export function StepIndicator({ current, total }: StepCounterProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const isActive = step === current
        const isCompleted = step < current

        return (
          <motion.div
            key={step}
            animate={{
              width: isActive ? 20 : 6,
              opacity: isActive || isCompleted ? 1 : 0.25,
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-1.5 rounded-full shrink-0"
            style={{
              background: isActive || isCompleted ? '#000' : '#000',
            }}
          />
        )
      })}
    </div>
  )
}
