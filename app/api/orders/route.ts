import { prisma } from '@/lib/prisma'
import { sendWhatsAppText } from '@/lib/whatsapp'

const EUR_TO_XOF = 655.957 // parité fixe CFA

const ADMIN_NUMBER = (
  process.env.WHATSAPP_ADMIN_NUMBER ??
  process.env.WHATSAPP_BUSINESS_NUMBER ??
  '221710581711'
).replace(/\D/g, '')

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      country,
      currency,
      paymentMethod,
      items,
    } = body

    if (!customerName || !customerPhone || !country || !paymentMethod || !items?.length) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // [SECURITY] Calcul du total côté serveur — ne jamais faire confiance au client
    const validatedItems = items as Array<{ productId: string; quantity: number; price: number }>
    if (validatedItems.some(i => !i.productId || i.quantity < 1 || i.price < 0)) {
      return Response.json({ error: 'Articles invalides' }, { status: 400 })
    }

    const computedTotal = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Convertir en XOF si commande EUR
    const totalAmount = currency === 'EUR'
      ? Math.round(computedTotal * EUR_TO_XOF)
      : Math.round(computedTotal)

    if (totalAmount <= 0) {
      return Response.json({ error: 'Total invalide' }, { status: 400 })
    }

    // Fetch product names for WA notification
    const productIds = validatedItems.map(i => i.productId)
    const productNames = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    })
    const nameMap = Object.fromEntries(productNames.map(p => [p.id, p.name]))

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        address: address || null,
        country,
        currency,
        totalAmount,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'new',
        items: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    })

    // Décrémenter le stock pour chaque article
    for (const item of validatedItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { bundleItems: true },
      })
      if (!product) continue

      if (product.isBundle && product.bundleItems.length > 0) {
        // Gamme : décrémenter chaque composant
        for (const bi of product.bundleItems) {
          const comp = await prisma.product.findUnique({ where: { id: bi.componentId } })
          if (!comp || comp.stockQty == null) continue
          const newQty = comp.stockQty - bi.qty * item.quantity
          await prisma.product.update({
            where: { id: bi.componentId },
            data: { stockQty: Math.max(0, newQty), inStock: newQty > 0 },
          })
        }
      } else if (product.stockQty != null) {
        // Produit simple avec stock fini
        const newQty = product.stockQty - item.quantity
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQty: Math.max(0, newQty), inStock: newQty > 0 },
        })
      }
    }

    // Notify admin on WhatsApp immediately (async — don't block response)
    const ref = order.id.slice(-8).toUpperCase()
    const total = currency === 'XOF'
      ? `${totalAmount.toLocaleString('fr-FR')} FCFA`
      : `${(computedTotal).toFixed(2)} €`
    const itemsText = validatedItems
      .map(i => `• ${nameMap[i.productId] ?? i.productId} ×${i.quantity}`)
      .join('\n')
    const payLabel: Record<string, string> = {
      wave: '💙 Wave', orange_money: '🟠 Orange Money', whatsapp: '💬 WhatsApp', cash: '💵 Espèces',
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://makine.store'
    const adminKey = process.env.ADMIN_PASSWORD ?? ''
    const confirmUrl = `${appUrl}/api/admin/confirm?ref=${ref}&key=${adminKey}`

    sendWhatsAppText(
      ADMIN_NUMBER,
      `🆕 *Nouvelle commande Makiné !*\n` +
      `📦 Réf : *${ref}*\n` +
      `👤 ${customerName} — ${customerPhone}\n` +
      `📍 ${address ?? 'Non précisée'}\n\n` +
      `${itemsText}\n\n` +
      `💰 *Total : ${total}*\n` +
      `💳 ${payLabel[paymentMethod] ?? paymentMethod}\n\n` +
      `👇 *Confirmer la commande :*\n${confirmUrl}`
    ).catch(e => console.error('[WA Admin notify]', e))

    // Notify customer on WhatsApp based on payment method
    const paymentInstructions: Record<string, string> = {
      wave:
        `💙 *Paiement Wave*\nVous allez recevoir une demande de paiement Wave sur votre téléphone. ` +
        `Veuillez l'accepter pour confirmer votre commande.`,
      orange_money:
        `🟠 *Paiement Orange Money*\nUne demande de paiement Orange Money sera envoyée sur votre numéro. ` +
        `Veuillez la valider pour confirmer votre commande.`,
      whatsapp:
        `💬 *Paiement WhatsApp*\nUn conseiller Makiné va vous contacter sous peu ` +
        `pour organiser le paiement et la livraison.`,
      cash:
        `💵 *Paiement à la livraison*\nVotre commande est enregistrée. ` +
        `Vous paierez à la réception de votre colis.`,
    }
    const customerNotif =
      `✅ *Commande Makiné reçue !*\n` +
      `📦 Réf : *${ref}*\n\n` +
      `*Votre panier :*\n${itemsText}\n\n` +
      `💰 *Total : ${total}*\n\n` +
      (paymentInstructions[paymentMethod] ?? `💳 Paiement : ${paymentMethod}`) +
      `\n\nMerci pour votre confiance ! *Makiné* 🌸`

    const normalizedCustomerPhone = customerPhone.replace(/\D/g, '')
    sendWhatsAppText(normalizedCustomerPhone, customerNotif)
      .catch(e => console.error('[WA Customer notify]', e))

    return Response.json({ orderId: order.id })
  } catch (err) {
    console.error('[API Orders]', err)
    return Response.json({ error: 'Erreur création commande' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return Response.json(orders)
  } catch (err) {
    console.error('[API Orders GET]', err)
    return Response.json({ error: 'Erreur' }, { status: 500 })
  }
}
