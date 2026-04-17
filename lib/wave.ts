import crypto from 'crypto'

const WAVE_BASE_URL = 'https://api.wave.com'

function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`[Wave] Env var manquante : ${key}`)
  return val
}

function signRequest(body: string): string {
  const secret = requireEnv('WAVE_SIGNING_SECRET')
  const timestamp = Math.floor(Date.now() / 1000)
  const sig = crypto.createHmac('sha256', secret)
    .update(`${timestamp}${body}`).digest('hex')
  return `t=${timestamp},v1=${sig}`
}

function headers(apiKey: string, body: string, idempotencyKey?: string) {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Wave-Signature': signRequest(body),
    ...(idempotencyKey && { 'Idempotency-Key': idempotencyKey }),
  }
}

export async function createWaveCheckout(params: {
  amount: number
  currency: 'XOF'
  error_url: string
  success_url: string
  client_reference: string
}) {
  if (params.amount <= 0) throw new Error('[Wave] amount doit être > 0')
  const apiKey = requireEnv('WAVE_CHECKOUT_API_KEY')
  const body = JSON.stringify({
    amount: String(Math.round(params.amount)),
    currency: params.currency,
    error_url: params.error_url,
    success_url: params.success_url,
    client_reference: params.client_reference,
  })
  const res = await fetch(`${WAVE_BASE_URL}/v1/checkout/sessions`, {
    method: 'POST',
    headers: headers(apiKey, body, crypto.randomUUID()),
    body,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`[Wave Checkout] HTTP ${res.status}: ${JSON.stringify(err)}`)
  }
  return res.json()
}

export async function createWavePayout(params: {
  mobile: string
  amount: number
  name?: string
  client_reference?: string
  payment_reason?: string
}) {
  if (!params.mobile.startsWith('+'))
    throw new Error('[Wave] mobile doit être E.164 (+221...)')
  if (params.amount <= 0) throw new Error('[Wave] amount doit être > 0')
  const apiKey = requireEnv('WAVE_API_KEY')
  const body = JSON.stringify({
    currency: 'XOF',
    receive_amount: String(Math.round(params.amount)),
    mobile: params.mobile,
    ...(params.name && { name: params.name }),
    ...(params.client_reference && { client_reference: params.client_reference }),
    payment_reason: params.payment_reason ?? 'Remboursement Makiné',
  })
  const res = await fetch(`${WAVE_BASE_URL}/v1/payout`, {
    method: 'POST',
    headers: headers(apiKey, body, crypto.randomUUID()),
    body,
  })
  if (!res.ok) throw new Error(`[Wave Payout] HTTP ${res.status}`)
  return res.json()
}

export async function getWavePayoutStatus(payoutId: string) {
  const apiKey = requireEnv('WAVE_API_KEY')
  const res = await fetch(`${WAVE_BASE_URL}/v1/payout/${payoutId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`[Wave] Payout ${payoutId} introuvable`)
  return res.json()
}

export function validateWaveWebhook(body: string, header: string): boolean {
  try {
    const secret = requireEnv('WAVE_SIGNING_SECRET')
    const [tPart, vPart] = header.split(',')
    const ts = tPart.replace('t=', '')
    const received = vPart.replace('v1=', '')
    const expected = crypto.createHmac('sha256', secret)
      .update(`${ts}${body}`).digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(received, 'hex'),
      Buffer.from(expected, 'hex')
    )
  } catch { return false }
}
