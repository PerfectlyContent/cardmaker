import { create } from 'zustand'
import type { ImportantDate } from '@/types'

const STORAGE_KEY = 'cardmaker_dates'
const ONBOARDING_KEY = 'cardmaker_dates_onboarded'

function loadDates(): ImportantDate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveDates(dates: ImportantDate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dates))
}

interface DateStore {
  dates: ImportantDate[]
  hasOnboarded: boolean

  addDate: (date: ImportantDate) => void
  removeDate: (id: string) => void
  updateDate: (id: string, updates: Partial<ImportantDate>) => void
  setOnboarded: () => void
}

export const useDateStore = create<DateStore>((set, get) => ({
  dates: loadDates(),
  hasOnboarded: localStorage.getItem(ONBOARDING_KEY) === 'true',

  addDate: (date) => {
    const next = [...get().dates, date]
    saveDates(next)
    set({ dates: next })
  },

  removeDate: (id) => {
    const next = get().dates.filter((d) => d.id !== id)
    saveDates(next)
    set({ dates: next })
  },

  updateDate: (id, updates) => {
    const next = get().dates.map((d) => (d.id === id ? { ...d, ...updates } : d))
    saveDates(next)
    set({ dates: next })
  },

  setOnboarded: () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    set({ hasOnboarded: true })
  },
}))

/** Get days until the next occurrence of a date */
export function getDaysUntil(dateStr: string, recurring: boolean): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr + 'T00:00:00')

  if (recurring) {
    const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate())
    thisYear.setHours(0, 0, 0, 0)
    if (thisYear >= today) {
      return Math.round((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }
    const nextYear = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate())
    return Math.round((nextYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** Get the next occurrence date for display */
export function getNextOccurrence(dateStr: string, recurring: boolean): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr + 'T00:00:00')

  if (!recurring) return date

  const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate())
  if (thisYear >= today) return thisYear
  return new Date(today.getFullYear() + 1, date.getMonth(), date.getDate())
}
