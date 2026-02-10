import { motion } from 'motion/react'

interface ChipProps {
  label: string
  emoji?: string
  selected?: boolean
  onClick?: () => void
}

export function Chip({ label, emoji, selected, onClick }: ChipProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
        transition-all duration-200 select-none
        ${
          selected
            ? 'bg-ink text-white font-semibold'
            : 'bg-bg-subtle text-text-muted hover:text-ink hover:bg-bg-subtle/80'
        }
      `}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      <span>{label}</span>
    </motion.button>
  )
}
