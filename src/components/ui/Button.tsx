import { motion } from 'motion/react'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 disabled:opacity-35 disabled:pointer-events-none'

  const variants = {
    primary:
      'text-white rounded-2xl hover:brightness-110 active:brightness-95',
    secondary:
      'text-ink rounded-2xl',
    ghost:
      'text-text-muted hover:text-ink hover:underline underline-offset-4',
  }

  const sizes = {
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-6 py-3.5 text-base',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  }

  const variantStyle = variant === 'primary' ? {
    background: 'linear-gradient(135deg, #7A1B2D, #5C0F20)',
    boxShadow: '0 4px 16px rgba(122,27,45,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
  } : variant === 'secondary' ? {
    background: '#FFFFFF',
    border: '1px solid rgba(122,27,45,0.12)',
    boxShadow: '0 2px 8px rgba(26,10,14,0.06)',
  } : undefined

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      style={variantStyle}
      {...(props as any)}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 rounded-full border-2 border-ink/15 border-t-ink"
        />
      ) : (
        icon
      )}
      {children}
    </motion.button>
  )
}
