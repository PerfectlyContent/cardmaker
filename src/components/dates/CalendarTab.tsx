import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useDateStore, getDaysUntil, getNextOccurrence } from '@/stores/dateStore'
import { useCardStore } from '@/stores/cardStore'
import { DateForm } from './DateForm'
import type { ImportantDate, Occasion } from '@/types'

const TYPE_EMOJI: Record<string, string> = {
  birthday: '🎂',
  anniversary: '💍',
  holiday: '🎉',
  custom: '📅',
}

const TYPE_TO_OCCASION: Record<string, Occasion> = {
  birthday: 'birthday',
  anniversary: 'wedding',
  holiday: 'holiday',
  custom: 'custom',
}

function MiniCalendar({ dates }: { dates: ImportantDate[] }) {
  const [monthOffset, setMonthOffset] = useState(0)

  const today = new Date()
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthName = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Day of week the month starts on (0=Sun)
  const startDay = new Date(year, month, 1).getDay()
  // Shift so Monday=0
  const startOffset = (startDay + 6) % 7

  // Dates with events this month
  const eventDays = useMemo(() => {
    const days = new Set<number>()
    for (const d of dates) {
      const next = getNextOccurrence(d.date, d.recurring)
      if (next.getMonth() === month && next.getFullYear() === year) {
        days.add(next.getDate())
      }
    }
    return days
  }, [dates, month, year])

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMonthOffset((o) => o - 1)}
          className="tappable-option w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </motion.button>
        <span className="text-white text-sm font-semibold">{monthName}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMonthOffset((o) => o + 1)}
          className="tappable-option w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-[10px] text-white/30 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const hasEvent = eventDays.has(day)
          const isTodayDay = isToday(day)
          return (
            <div key={day} className="flex flex-col items-center py-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium relative"
                style={{
                  background: isTodayDay ? 'rgba(255,255,255,0.9)' : hasEvent ? 'rgba(184,58,74,0.4)' : 'transparent',
                  color: isTodayDay ? '#5C0F20' : hasEvent ? '#fff' : 'rgba(255,255,255,0.5)',
                }}
              >
                {day}
              </div>
              {hasEvent && (
                <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: '#B83A4A' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UpcomingDateCard({ item, onCreateCard }: { item: ImportantDate & { daysUntil: number }; onCreateCard: (item: ImportantDate) => void }) {
  const { t } = useTranslation()
  const removeDate = useDateStore((s) => s.removeDate)

  const daysText =
    item.daysUntil === 0
      ? t('dates.today', 'Today!')
      : item.daysUntil === 1
        ? t('dates.tomorrow', 'Tomorrow')
        : t('dates.inDays', '{{count}} days away', { count: item.daysUntil })

  const nextDate = getNextOccurrence(item.date, item.recurring)
  const dateDisplay = nextDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          {TYPE_EMOJI[item.type] || '📅'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-semibold truncate">{item.name}</div>
          <div className="text-white/40 text-xs mt-0.5">{dateDisplay}</div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: item.daysUntil <= 2 ? 'rgba(184,58,74,0.5)' : item.daysUntil <= 7 ? 'rgba(255,180,50,0.3)' : 'rgba(255,255,255,0.1)',
              color: item.daysUntil <= 2 ? '#fff' : item.daysUntil <= 7 ? '#FFD080' : 'rgba(255,255,255,0.5)',
            }}
          >
            {daysText}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onCreateCard(item)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(255,255,255,0.9)', color: '#5C0F20' }}
        >
          <span>💌</span>
          {t('dates.createCard', 'Create a card')}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => removeDate(item.id)}
          className="tappable-option w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}

function SmsReminderPreview({ item }: { item: ImportantDate & { daysUntil: number } }) {
  const { t } = useTranslation()

  const reminderDate = new Date(getNextOccurrence(item.date, item.recurring))
  reminderDate.setDate(reminderDate.getDate() - 2)
  const sendDate = reminderDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  const typeLabel = item.type === 'birthday' ? 'birthday' : item.type === 'anniversary' ? 'anniversary' : 'special day'

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      {/* SMS header */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(76,175,80,0.3)' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(76,175,80,0.9)">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
        <span className="text-white/50 text-[10px] font-medium uppercase tracking-wider">
          {t('dates.smsPreview', 'SMS Reminder Preview')}
        </span>
      </div>

      <div className="px-4 py-3">
        {item.phone && (
          <div className="text-white/30 text-[10px] mb-2">
            {t('dates.to', 'To')}: {item.phone}
          </div>
        )}
        <div className="text-white/80 text-xs leading-relaxed rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {t('dates.smsMessage', "Hey! {{name}}'s {{type}} is in 2 days {{emoji}} Don't forget to create a card for them!", {
            name: item.name,
            type: typeLabel,
            emoji: TYPE_EMOJI[item.type] || '🎉',
          })}
        </div>
        <div className="text-white/25 text-[10px] mt-2 flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {t('dates.sendsOn', 'Sends')}: {sendDate} ({t('dates.daysBefore', '2 days before')})
        </div>
      </div>
    </div>
  )
}

export function CalendarTab() {
  const { t } = useTranslation()
  const dates = useDateStore((s) => s.dates)
  const store = useCardStore()
  const [showAddForm, setShowAddForm] = useState(false)

  // Sort dates by upcoming
  const upcoming = useMemo(() => {
    return dates
      .map((d) => ({ ...d, daysUntil: getDaysUntil(d.date, d.recurring) }))
      .filter((d) => d.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }, [dates])

  // Dates within SMS reminder range (<=7 days)
  const reminderDates = upcoming.filter((d) => d.daysUntil > 0 && d.daysUntil <= 7)

  const handleCreateCard = (item: ImportantDate) => {
    const occasion = TYPE_TO_OCCASION[item.type] || 'custom'
    store.setOccasion(occasion as Occasion)
    store.setRecipientName(item.name)
    store.setMode('guided')
  }

  return (
    <div className="px-6 pb-28 flex flex-col overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 120px)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="text-2xl font-bold text-white mb-1">
          {t('dates.calendarTitle', 'My Dates')}
        </h1>
        <p className="text-white/40 text-sm">
          {t('dates.calendarSubtitle', 'Important dates & card reminders')}
        </p>
      </motion.div>

      {/* Mini Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-5"
      >
        <MiniCalendar dates={dates} />
      </motion.div>

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
            {t('dates.upcoming', 'Upcoming')}
          </h2>
          <div className="space-y-2">
            {upcoming.slice(0, 5).map((item) => (
              <UpcomingDateCard key={item.id} item={item} onCreateCard={handleCreateCard} />
            ))}
          </div>
        </motion.div>
      )}

      {/* SMS Reminder Previews */}
      {reminderDates.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-5"
        >
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
            {t('dates.reminders', 'SMS Reminders')}
          </h2>
          <div className="space-y-2">
            {reminderDates.map((item) => (
              <SmsReminderPreview key={item.id} item={item} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {dates.length === 0 && !showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center py-8"
        >
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-white text-base font-semibold mb-1">
            {t('dates.emptyTitle', 'No dates yet')}
          </h3>
          <p className="text-white/40 text-sm mb-5">
            {t('dates.emptySubtitle', "Add birthdays & anniversaries to get reminded to send cards")}
          </p>
        </motion.div>
      )}

      {/* Add date form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('dates.addNew', 'Add new date')}
            </h2>
            <DateForm onAdd={() => setShowAddForm(false)} compact />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add date FAB */}
      {!showAddForm && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.8)',
            border: '1px dashed rgba(255,255,255,0.2)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('dates.addDate', 'Add date')}
        </motion.button>
      )}

      {/* Demo banner for SMS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-5 rounded-2xl p-4 text-center"
        style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.15)' }}
      >
        <div className="text-sm mb-1">📱</div>
        <p className="text-white/60 text-xs leading-relaxed">
          {t('dates.smsBanner', 'SMS reminders will notify you 2 days before each date to create and send a card.')}
        </p>
        <div className="text-white/30 text-[10px] mt-1 font-medium">
          {t('dates.comingSoon', 'Coming soon')}
        </div>
      </motion.div>
    </div>
  )
}
