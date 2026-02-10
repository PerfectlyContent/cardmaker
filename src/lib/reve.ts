const API_URL = 'https://api.reve.com/v1/image/create'

function getApiKey(): string {
  const key = import.meta.env.VITE_REVE_API_KEY
  if (!key) {
    throw new Error('Reve API key not configured. Set VITE_REVE_API_KEY in .env')
  }
  return key
}

/**
 * Generate an image using Reve AI.
 * Returns a data URL (base64-encoded PNG) that can be used directly as an img src.
 */
export async function generateImage(prompt: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '1:1',
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `Reve API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.content_violation) {
    throw new Error('Content policy violation')
  }

  if (!data.image) {
    throw new Error('No image returned from Reve API')
  }

  return `data:image/png;base64,${data.image}`
}
