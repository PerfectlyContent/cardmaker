import type { BackgroundImage } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function searchImages(
  query: string,
  page = 1,
  perPage = 12,
): Promise<BackgroundImage[]> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: String(perPage),
    orientation: 'square',
  })

  const response = await fetch(`${API_BASE}/api/pexels/search?${params}`)

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`)
  }

  const data = await response.json()

  return (data.photos || []).map((photo: Record<string, unknown>): BackgroundImage => {
    const src = photo.src as Record<string, string>
    return {
      id: String(photo.id),
      urls: {
        raw: src.original,
        full: src.original,
        regular: src.large2x || src.large,
        small: src.medium,
        thumb: src.small,
      },
      alt_description: (photo.alt as string) || null,
      photographer: photo.photographer as string,
      photographerUrl: photo.photographer_url as string,
      width: photo.width as number,
      height: photo.height as number,
    }
  })
}
