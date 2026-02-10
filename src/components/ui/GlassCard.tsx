import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

interface PaperCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
  hover?: boolean
  flat?: boolean
}

export function GlassCard({ children, className = '', hover = false, flat = false, ...props }: PaperCardProps) {
  return (
    <motion.div
      className={`${flat ? 'paper-flat' : 'paper'} p-5 ${className}`}
      whileHover={
        hover
          ? { y: -2, boxShadow: '0 2px 6px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)' }
          : undefined
      }
      whileTap={
        hover
          ? { y: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 3px 8px rgba(0,0,0,0.03)' }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
