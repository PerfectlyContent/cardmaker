import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ─── API Proxy Routes ───

// Gemini — text generation
app.post('/api/gemini/generate', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' })

  try {
    const { contents, generationConfig } = req.body
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig }),
      }
    )
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json(data)
    res.json(data)
  } catch (err) {
    console.error('Gemini proxy error:', err)
    res.status(500).json({ error: 'Gemini request failed' })
  }
})

// Pexels — image search
app.get('/api/pexels/search', async (req, res) => {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Pexels API key not configured' })

  try {
    const params = new URLSearchParams(req.query)
    const response = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: apiKey },
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json(data)
    res.json(data)
  } catch (err) {
    console.error('Pexels proxy error:', err)
    res.status(500).json({ error: 'Pexels request failed' })
  }
})

// Reve — AI image generation
app.post('/api/reve/generate', async (req, res) => {
  const apiKey = process.env.REVE_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Reve API key not configured' })

  try {
    const response = await fetch('https://api.reve.com/v1/image/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json(data)
    res.json(data)
  } catch (err) {
    console.error('Reve proxy error:', err)
    res.status(500).json({ error: 'Reve request failed' })
  }
})

// ─── Serve static files (Vite build output) ───
app.use(express.static(path.join(__dirname, 'dist')))

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
