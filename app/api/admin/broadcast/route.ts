import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppText } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'
  if (key !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as {
    message: string
    segment: 'all' | 'sn' | 'fr' | 'wholesale'
    preview?: boolean
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'Message requis' }, { status: 400 })
  }

  // Build recipient list from unique customer phones in orders
  const orders = await prisma.order.findMany({
    where: {
      ...(body.segment === 'sn' ? { country: 'SN' } : {}),
      ...(body.segment === 'fr' ? { country: 'FR' } : {}),
      ...(body.segment === 'wholesale' ? { isWholesale: true } : {}),
      paymentStatus: 'paid',
    },
    select: { customerPhone: true, customerName: true, country: true },
    orderBy: { createdAt: 'desc' },
  })

  // Deduplicate by phone
  const seen = new Set<string>()
  const recipients: Array<{ phone: string; name: string }> = []
  for (const o of orders) {
    if (!seen.has(o.customerPhone)) {
      seen.add(o.customerPhone)
      recipients.push({ phone: o.customerPhone, name: o.customerName })
    }
  }

  // Preview mode — just return count
  if (body.preview) {
    return NextResponse.json({ count: recipients.length, recipients: recipients.slice(0, 5) })
  }

  // Send messages with 1s delay between each to avoid rate limiting
  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const r of recipients) {
    try {
      // Personalize message: replace {nom} with customer name
      const personalizedMsg = body.message.replace(/\{nom\}/gi, r.name.split(' ')[0])
      await sendWhatsAppText(r.phone, personalizedMsg)
      sent++
      // Rate limit: 1 message per second
      await new Promise(resolve => setTimeout(resolve, 1100))
    } catch (err) {
      failed++
      errors.push(`${r.phone}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ sent, failed, total: recipients.length, errors: errors.slice(0, 10) })
}
