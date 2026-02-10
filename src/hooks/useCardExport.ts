import { useCallback, useRef } from 'react'
import { toPng } from 'html-to-image'
import { useCardStore } from '@/stores/cardStore'

export function useCardExport() {
  const cardRef = useRef<HTMLDivElement>(null)
  const setExportedBlob = useCardStore((s) => s.setExportedBlob)

  const exportCard = useCallback(async (): Promise<Blob | null> => {
    const node = cardRef.current
    if (!node) return null

    try {
      // Wait for fonts to be ready
      await document.fonts.ready

      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        width: 1080,
        height: 1080,
        cacheBust: true,
        skipAutoScale: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      })

      const response = await fetch(dataUrl)
      const blob = await response.blob()
      setExportedBlob(blob)
      return blob
    } catch (err) {
      console.error('Failed to export card:', err)
      return null
    }
  }, [setExportedBlob])

  return { cardRef, exportCard }
}
