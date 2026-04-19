import crypto from 'crypto'

// WaSenderAPI — https://wasenderapi.com/api-docs
// Chaque session génère son propre Bearer token (lié à la session WhatsApp)
// Auth : Authorization: Bearer {WASENDER_API_KEY}

const WA_BASE = 'https://www.wasenderapi.com/api'

function getHeaders() {
  const apiKey = process.env.WASENDER_API_KEY
  if (!apiKey) throw new Error('[WA] WASENDER_API_KEY manquant')
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

// Normalize phone: remove spaces, dashes, parentheses — keep digits and optional leading +
function normalizePhone(to: string): string {
  return to.replace(/[\s\-\(\)\.]/g, '')
}

// POST /api/send-message — texte (avec retry automatique si 429)
export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  if (!to || !text) throw new Error('[WA] to et text requis')
  const body = JSON.stringify({ to: normalizePhone(to), text })

  const attempt = async () => fetch(`${WA_BASE}/send-message`, {
    method: 'POST',
    headers: getHeaders(),
    body,
  })

  let res = await attempt()

  // Retry once on 429 — wait retry_after seconds (max 10s)
  if (res.status === 429) {
    const err = await res.json().catch(() => ({} as { retry_after?: number }))
    const wait = Math.min(err.retry_after ?? 5, 10) * 1000
    await new Promise(r => setTimeout(r, wait))
    res = await attempt()
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error(`[WA] Erreur texte ${to}: HTTP ${res.status}`, err)
  }
}

// POST /api/send-message — image via URL
// Body: { to: "+221...", imageUrl: "https://...", text: "caption" }
export async function sendWhatsAppImage(to: string, imageUrl: string, caption: string): Promise<void> {
  const res = await fetch(`${WA_BASE}/send-message`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ to: normalizePhone(to), imageUrl, text: caption }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error(`[WA] Erreur image ${to}: HTTP ${res.status}`, err)
  }
}

// POST /api/send-message — document via URL
export async function sendWhatsAppDocument(
  to: string,
  documentUrl: string,
  fileName: string,
  caption?: string
): Promise<void> {
  const res = await fetch(`${WA_BASE}/send-message`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ to, documentUrl, fileName, ...(caption && { text: caption }) }),
  })
  if (!res.ok) console.error(`[WA] Erreur document ${to}: HTTP ${res.status}`)
}

// Validation webhook WaSender — timingSafeEqual pour éviter les timing attacks
export function validateWASenderWebhook(secret: string): boolean {
  const expected = process.env.WASENDER_WEBHOOK_SECRET ?? ''

  // En dev sans secret : accepter — en prod : rejeter si non configuré
  if (!expected) {
    if (process.env.NODE_ENV === 'production') return false
    return true
  }

  if (secret.length !== expected.length) return false
  try {
    return crypto.timingSafeEqual(
      Buffer.from(secret, 'utf8'),
      Buffer.from(expected, 'utf8')
    )
  } catch {
    return false
  }
}
