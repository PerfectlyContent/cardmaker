import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { toPng } from 'html-to-image'
import { useCardStore } from '@/stores/cardStore'
import { shareCard, downloadBlob, shareViaWhatsApp, copyToClipboard } from '@/lib/share'

export function ShareScreen({ onEdit }: { onEdit: () => void }) {
  const { t } = useTranslation()
  const reset = useCardStore((s) => s.reset)
  const [toast, setToast] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const getBlob = useCallback(async (): Promise<Blob | null> => {
    const el = document.querySelector('[data-export-canvas]') as HTMLDivElement | null
    if (!el) return null
    setExporting(true)
    try {
      await document.fonts.ready
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        width: 1080,
        height: 1080,
        cacheBust: true,
      })
      const res = await fetch(dataUrl)
      return await res.blob()
    } catch (err) {
      console.error('Export failed:', err)
      return null
    } finally {
      setExporting(false)
    }
  }, [])

  const handleShare = async () => {
    const blob = await getBlob()
    if (!blob) return
    const result = await shareCard(blob)
    if (result === 'shared') showToast(t('preview.shareSuccess'))
    else if (result === 'downloaded') showToast(t('preview.downloadSuccess'))
  }

  const handleDownload = async () => {
    const blob = await getBlob()
    if (!blob) return
    downloadBlob(blob, 'card.png')
    showToast(t('preview.downloadSuccess'))
  }

  const handleWhatsApp = async () => {
    const blob = await getBlob()
    if (!blob) return
    shareViaWhatsApp(blob)
  }

  const handleCopy = async () => {
    const blob = await getBlob()
    if (!blob) return
    const ok = await copyToClipboard(blob)
    if (ok) showToast(t('preview.copySuccess'))
  }

  const actions = [
    {
      label: t('preview.share'),
      onClick: handleShare,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      label: t('preview.whatsapp'),
      onClick: handleWhatsApp,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: t('preview.download'),
      onClick: handleDownload,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
    {
      label: t('preview.copy'),
      onClick: handleCopy,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      ),
    },
  ]

  return (
    <div>
      {/* Icon action row */}
      <div className="flex items-center justify-center gap-5 mb-4">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
            whileTap={{ scale: 0.9 }}
            onClick={action.onClick}
            disabled={exporting}
            className="flex flex-col items-center gap-1.5 disabled:opacity-40"
          >
            <div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[#7A1B2D] transition-all"
              style={{
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(26,10,14,0.1), 0 0 0 1px rgba(122,27,45,0.06)',
              }}
            >
              {action.icon}
            </div>
            <span className="text-[10px] font-medium text-text-muted">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Edit & New */}
      <div className="flex gap-2.5">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-ink bg-white/60 border border-border-strong transition-colors flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          {t('toolbar.edit', 'Edit card')}
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-terracotta bg-terracotta/10 border border-terracotta/20 transition-colors flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('preview.startOver')}
        </motion.button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white z-50"
            style={{
              background: 'linear-gradient(135deg, #1A0A0E, #4A2028)',
              boxShadow: '0 4px 16px rgba(26, 10, 14, 0.3)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
