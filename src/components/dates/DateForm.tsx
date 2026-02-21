import { useState } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useDateStore } from '@/stores/dateStore'
import type { DateType } from '@/types'

const DATE_TYPES: { id: DateType; emoji: string; labelKey: string }[] = [
  { id: 'birthday', emoji: '🎂', labelKey: 'dates.birthday' },
  { id: 'anniversary', emoji: '💍', labelKey: 'dates.anniversary' },
  { id: 'holiday', emoji: '🎉', labelKey: 'dates.holiday' },
  { id: 'custom', emoji: '📅', labelKey: 'dates.custom' },
]

interface DateFormProps {
  onAdd?: () => void
  compact?: boolean
}

export function DateForm({ onAdd, compact }: DateFormProps) {
  const { t } = useTranslation()
  const addDate = useDateStore((s) => s.addDate)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState<DateType>('birthday')
  const [phone, setPhone] = useState('')

  const canAdd = name.trim() && date

  const handleAdd = () => {
    if (!canAdd) return
    addDate({
      id: crypto.randomUUID(),
      name: name.trim(),
      date,
      type,
      phone: phone.trim() || undefined,
      recurring: type !== 'custom',
    })
    setName('')
    setDate('')
    setPhone('')
    onAdd?.()
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('dates.namePlaceholder', "Person's name")}
        className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
      />

      {/* Date */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/20 date-input-dark"
        style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', colorScheme: 'dark' }}
      />

      {/* Type chips */}
      <div className="flex gap-2 flex-wrap">
        {DATE_TYPES.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setType(item.id)}
            className="tappable-option flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: type === item.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.12)',
              color: type === item.id ? '#5C0F20' : 'rgba(255,255,255,0.7)',
            }}
          >
            <span>{item.emoji}</span>
            <span>{t(item.labelKey)}</span>
          </motion.button>
        ))}
      </div>

      {/* Phone (optional) */}
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t('dates.phonePlaceholder', 'Phone number (for SMS reminders)')}
        className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
      />

      {/* Add button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleAdd}
        disabled={!canAdd}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
        style={{
          background: canAdd ? '#fff' : 'rgba(255,255,255,0.2)',
          color: canAdd ? '#5C0F20' : 'rgba(255,255,255,0.5)',
        }}
      >
        {t('dates.addDate', 'Add date')}
      </motion.button>
    </div>
  )
}
