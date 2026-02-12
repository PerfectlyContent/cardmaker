const API_BASE = import.meta.env.VITE_API_BASE || ''

/**
 * Generate an image using Reve AI via server proxy.
 * Returns a data URL (base64-encoded PNG) that can be used directly as an img src.
 */
export async function generateImage(prompt: string): Promise<string> {
  const response = await fetch(`${API_BASE}/api/reve/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspect_ratio: '1:1' }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Reve API error: ${response.status}`)
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
