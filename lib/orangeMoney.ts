let cachedToken: { value: string; expiresAt: number } | null = null

function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`[OrangeMoney] Env var manquante : ${key}`)
  return val
}

export async function getOrangeMoneyToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 5 * 60 * 1000)
    return cachedToken.value

  const creds = Buffer.from(
    `${requireEnv('ORANGE_MONEY_CLIENT_ID')}:${requireEnv('ORANGE_MONEY_CLIENT_SECRET')}`
  ).toString('base64')

  const res = await fetch(`${requireEnv('ORANGE_MONEY_BASE_URL')}/oauth/v3/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`[OrangeMoney] Auth échouée : HTTP ${res.status}`)

  const data = await res.json()
  cachedToken = {
    value: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  }
  return data.access_token
}

async function callCashIn(params: {
  amount: number
  currency: 'XOF'
  orderId: string
  customerPhone: string
  description: string
  notifUrl: string
  returnUrl: string
  token: string
}) {
  const phone = params.customerPhone.replace(/^\+/, '')
  const res = await fetch(`${requireEnv('ORANGE_MONEY_BASE_URL')}/payment/v1/cashIn`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriberMsisdn: phone,
      amount: params.amount,
      currency: params.currency,
      orderId: params.orderId,
      description: params.description,
      payToken: `MAKINE_${params.orderId}_${Date.now()}`,
      notifUrl: params.notifUrl,
      returnUrl: params.returnUrl,
    }),
  })
  return res
}

export async function initiateOrangeMoneyPayment(params: {
  amount: number
  currency: 'XOF'
  orderId: string
  customerPhone: string
  description: string
  notifUrl: string
  returnUrl: string
}) {
  if (params.amount <= 0) throw new Error('[OrangeMoney] amount doit être > 0')

  const token = await getOrangeMoneyToken()
  let res = await callCashIn({ ...params, token })

  // Retry une fois si token expiré (401)
  if (res.status === 401) {
    cachedToken = null
    const freshToken = await getOrangeMoneyToken()
    res = await callCashIn({ ...params, token: freshToken })
  }

  if (!res.ok) throw new Error(`[OrangeMoney] HTTP ${res.status}`)
  return res.json()
}

export async function checkOrangeMoneyStatus(payToken: string) {
  const token = await getOrangeMoneyToken()
  const res = await fetch(
    `${requireEnv('ORANGE_MONEY_BASE_URL')}/payment/v1/cashIn/${payToken}/status`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error('[OrangeMoney] Statut introuvable')
  return res.json()
}
