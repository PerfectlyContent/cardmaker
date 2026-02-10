import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] })
  return () => observer.disconnect()
}

function getSnapshot() {
  return document.documentElement.dir === 'rtl'
}

export function useRTL(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
