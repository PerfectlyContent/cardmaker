import type { BackgroundImage } from '@/types'

const BASE_URL = 'https://api.pexels.com/v1'

function getApiKey(): string {
  const key = import.meta.env.VITE_PEXELS_API_KEY
  if (!key) {
    throw new Error('Pexels API key not configured. Set VITE_PEXELS_API_KEY in .env')
  }
  return key
}

export async function searchImages(
  query: string,
  page = 1,
  perPage = 12,
): Promise<BackgroundImage[]> {
  const apiKey = getApiKey()

  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: String(perPage),
    orientation: 'square',
  })

  const response = await fetch(`${BASE_URL}/search?${params}`, {
    headers: {
      Authorization: apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`)
  }

  const data = await response.json()

  // Map Pexels response to our BackgroundImage interface
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
