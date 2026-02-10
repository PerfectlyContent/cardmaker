import { type ReactNode } from 'react'
import { motion } from 'motion/react'

interface CapsuleBarProps {
  children: ReactNode
}

export function CapsuleBar({ children }: CapsuleBarProps) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="capsule-bar z-30"
      style={{
        position: 'fixed',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        left: 16,
        right: 16,
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: '60vh',
        overscrollBehavior: 'contain',
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="px-4 py-3"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
