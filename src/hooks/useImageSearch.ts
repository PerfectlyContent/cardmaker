import { useCallback, useRef } from 'react'
import { searchImages } from '@/lib/pexels'
import { buildImageSearchQuery } from '@/lib/prompts'
import { useCardStore } from '@/stores/cardStore'
import type { Occasion, CardVibe } from '@/types'

export function useImageSearch() {
  const setBackgroundImages = useCardStore((s) => s.setBackgroundImages)
  const setIsLoadingImages = useCardStore((s) => s.setIsLoadingImages)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const search = useCallback(
    async (occasion: Occasion | null, vibe: CardVibe | null, rawQuery?: string) => {
      let query: string
      if (rawQuery) {
        // Strip words that produce bad Pexels results (3D renders instead of backgrounds)
        const cleaned = rawQuery.replace(/\b(cartoon|anime|illustration|drawing|clipart|3d)\b/gi, '').trim()
        // If user already included background-related words, use as-is; otherwise append
        const bgWords = /background|wallpaper|texture|pattern|abstract|gradient|bokeh/i
        query = bgWords.test(cleaned) ? cleaned : `${cleaned} aesthetic texture background`
      } else {
        query = buildImageSearchQuery(occasion, vibe)
      }
      setIsLoadingImages(true)

      try {
        const images = await searchImages(query)
        setBackgroundImages(images)
      } catch (err) {
        console.error('Image search failed:', err)
        setBackgroundImages([])
      } finally {
        setIsLoadingImages(false)
      }
    },
    [setBackgroundImages, setIsLoadingImages],
  )

  const debouncedSearch = useCallback(
    (occasion: Occasion | null, vibe: CardVibe | null) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => search(occasion, vibe), 300)
    },
    [search],
  )

  return { search, debouncedSearch }
}
