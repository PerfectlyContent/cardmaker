export async function shareCard(blob: Blob): Promise<'shared' | 'downloaded' | 'unsupported'> {
  const file = new File([blob], 'card.png', { type: 'image/png' })

  // Try native Web Share API (works great on mobile)
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Card Maker',
        text: 'Check out this card I made!',
      })
      return 'shared'
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return 'unsupported' // User cancelled
      }
    }
  }

  // Fallback: download
  downloadBlob(blob, 'card.png')
  return 'downloaded'
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function shareViaWhatsApp(blob: Blob) {
  // WhatsApp doesn't support direct file sharing via URL scheme on all platforms.
  // Best approach: use Web Share API which opens WhatsApp in share sheet.
  // Fallback: open WhatsApp with text only.
  const file = new File([blob], 'card.png', { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file] })
  } else {
    // Text-only fallback
    window.open('https://wa.me/?text=Check%20out%20this%20card%20I%20made!', '_blank')
  }
}

export function shareViaEmail(blob: Blob) {
  // Email with attachment requires Web Share API
  const file = new File([blob], 'card.png', { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file] })
  } else {
    // Fallback: open mailto
    window.open('mailto:?subject=A%20card%20for%20you&body=I%20made%20you%20a%20card!', '_blank')
  }
}

export async function copyToClipboard(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
    return true
  } catch {
    return false
  }
}
