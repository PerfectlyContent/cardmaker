import { type ReactNode } from 'react'
import { motion } from 'motion/react'

interface CapsuleBarProps {
  children: ReactNode
}

/** Floating bottom capsule — still used for share screen overlay */
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
        className="px-4 py-4"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

interface FlowPanelProps {
  children: ReactNode
  /** Header row with back button, step indicator, etc. */
  header?: ReactNode
}

/** Top flow panel — clean white panel like iOS */
export function FlowPanel({ children, header }: FlowPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flow-panel z-30 relative flex flex-col"
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: '52vh',
        overscrollBehavior: 'contain',
      }}
    >
      {header && (
        <div
          className="flex items-center gap-3 px-5 pb-1 shrink-0"
          style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
        >
          {header}
        </div>
      )}
      <div className="px-5 pb-5 pt-1 flex-1 min-h-0">
        {children}
      </div>
    </motion.div>
  )
}
