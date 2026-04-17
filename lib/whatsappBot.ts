import { prisma } from '@/lib/prisma'
import { sendWhatsAppText, sendWhatsAppImage } from './whatsapp'
import { createWaveCheckout } from './wave'
import { initiateOrangeMoneyPayment } from './orangeMoney'
import { products } from '@/data/products'
import { getProductImageUrl } from '@/data/productImages'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://makine.store'
const BOT_NUMBER = (process.env.WHATSAPP_BUSINESS_NUMBER ?? '+221710581711').replace('+', '')
const ADMIN_NUMBER = (
  process.env.WHATSAPP_ADMIN_NUMBER ??
  process.env.WHATSAPP_BUSINESS_NUMBER ??
  '221710581711'
).replace('+', '')

function normalizePhone(from: string): string {
  return from.replace('@s.whatsapp.net', '').replace('@c.us', '').replace('+', '')
}

function safeParseCart(raw: unknown): Array<{ productId: string; quantity: number }> {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is { productId: string; quantity: number } =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.productId === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
    )
  } catch {
    return []
  }
}

async function updateSession(
  phone: string,
  state: string,
  extra?: Record<string, unknown>
) {
  return prisma.whatsappSession.upsert({
    where: { phone },
    update: { state, lastMsg: new Date(), ...extra },
    create: {
      phone,
      state,
      country: phone.startsWith('221') ? 'SN' : 'FR',
      ...extra,
    },
  })
}

function formatPrice(p: (typeof products)[0], country: string): string {
  if (country === 'SN') {
    if (p.priceXOF === 0) return 'Prix sur demande'
    const promo = p.priceXOF2
      ? ` _(2 pour ${p.priceXOF2.toLocaleString('fr-FR')} FCFA)_`
      : ''
    return `${p.priceXOF.toLocaleString('fr-FR')} FCFA${promo}`
  }
  return p.price === 0 ? 'Prix sur demande' : `${p.price.toFixed(2)} €`
}

async function calcTotal(
  cart: Array<{ productId: string; quantity: number }>,
  country: string
) {
  return cart.reduce((acc, item) => {
    const p = products.find((pr) => pr.id === item.productId)
    if (!p) return acc
    return acc + (country === 'SN' ? p.priceXOF : p.price) * item.quantity
  }, 0)
}

async function notifyAdmin(order: {
  id: string
  customerName: string
  customerPhone: string
  totalAmount: number
  currency: string
  paymentMethod: string
  items: Array<{ quantity: number; price: number; product?: { name: string } | null }>
}) {
  const items = order.items.map((i) => `• ${i.product?.name ?? '?'} ×${i.quantity}`).join('\n')
  const total =
    order.currency === 'XOF'
      ? `${order.totalAmount.toLocaleString('fr-FR')} FCFA`
      : `${order.totalAmount.toFixed(2)} €`
  await sendWhatsAppText(
    ADMIN_NUMBER,
    `🆕 *Nouvelle commande Makiné !*\n📦 Réf : *${order.id.slice(-8).toUpperCase()}*\n👤 ${order.customerName} — ${order.customerPhone}\n\n${items}\n\n💰 *Total : ${total}*\n💳 ${order.paymentMethod}\n\n_Voir admin : https://makine.store/admin_`
  )
}

export async function processWhatsAppMessage(params: {
  from: string
  body: string
  messageId: string
}) {
  const phone = normalizePhone(params.from)
  const msg = params.body.trim().toLowerCase()

  // Anti-boucle
  if (phone === BOT_NUMBER) return

  // ── Admin command: CONF [ref] — confirm an order from WhatsApp ──
  if (phone === ADMIN_NUMBER && msg.startsWith('conf ')) {
    const ref = msg.split(' ')[1]?.toUpperCase()
    if (!ref || ref.length < 6) {
      await sendWhatsAppText(phone, `❌ Format : *CONF [référence]* — ex: CONF T8H4CSRM`)
      return
    }
    // Find order by last 8 chars of ID (case-insensitive)
    const orders = await prisma.order.findMany({
      take: 200,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    })
    const order = orders.find(o => o.id.slice(-8).toUpperCase() === ref)
    if (!order) {
      await sendWhatsAppText(phone, `❌ Commande *${ref}* introuvable.`)
      return
    }
    if (order.status === 'confirmed') {
      await sendWhatsAppText(phone, `ℹ️ Commande *${ref}* déjà confirmée.`)
      return
    }
    // Update order
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'confirmed', paymentStatus: 'paid', whatsappSent: true },
    })
    // Notify customer
    const total = order.currency === 'XOF'
      ? `${order.totalAmount.toLocaleString('fr-FR')} FCFA`
      : `${order.totalAmount.toFixed(2)} €`
    const itemsText = order.items.map(i => `• ${i.product.name} ×${i.quantity}`).join('\n')
    const customerMsg =
      `✅ *Commande Makiné confirmée !*\n` +
      `📦 Réf : *${ref}*\n\n` +
      `*Votre commande :*\n${itemsText}\n\n` +
      `💰 *Total : ${total}*\n\n` +
      `🚚 Votre commande est confirmée et en cours de préparation.\n` +
      `📞 +221 71 058 17 11\nMerci ! *Makiné* 🌸`
    const customerPhone = order.customerPhone.replace(/\D/g, '')
    await sendWhatsAppText(customerPhone, customerMsg)
    await sendWhatsAppText(phone, `✅ Commande *${ref}* confirmée. Client notifié sur ${order.customerPhone}.`)
    return
  }

  const session = await prisma.whatsappSession.findUnique({ where: { phone } })
  const country = session?.country ?? (phone.startsWith('221') ? 'SN' : 'FR')

  // Waiting state — order in progress
  if (session?.state === 'waiting') {
    await sendWhatsAppText(
      phone,
      `⏳ Votre commande est en cours de traitement.\n\nTapez *0* pour retourner au menu ou *1* pour recommencer.`
    )
    return
  }

  // AIDE / HELP command
  if (msg === 'aide' || msg === 'help') {
    const helpAdmin = phone === ADMIN_NUMBER
      ? `\n\n👑 *Commandes admin :*\n✅ *CONF [réf]* — Confirmer une commande`
      : ''
    await sendWhatsAppText(
      phone,
      `ℹ️ *Commandes disponibles :*\n\n🔢 *1* — Catalogue\n🔢 *2* — Commander\n🔢 *3* — Suivre commande\n🔢 *0* — Menu\n\n🛒 *CMD [id]* — Ajouter au panier\n🛒 *CMD [id] [qté]* — Ajouter avec quantité\n🗑️ *SUPPR [id]* — Retirer du panier\n👀 *PANIER* — Voir le panier\n🗑️ *VIDER* — Vider le panier\n✅ *VALIDER* — Commander\n❓ *AIDE* — Cette aide${helpAdmin}`
    )
    return
  }

  // PROMO command (placeholder)
  if (msg.startsWith('promo ')) {
    const code = msg.split(' ')[1]?.toUpperCase()
    await sendWhatsAppText(
      phone,
      `🎁 Code *${code}* — fonctionnalité bientôt disponible !\nTapez *0* pour le menu.`
    )
    return
  }

  // SUPPR command — remove item from cart
  if (msg.startsWith('suppr ')) {
    const productId = msg.split(' ')[1]?.trim()
    const cart = safeParseCart(session?.cart).filter((i) => i.productId !== productId)
    await updateSession(phone, session?.state ?? 'cart', { cart: JSON.stringify(cart) })
    await sendWhatsAppText(
      phone,
      `🗑️ Article retiré.\n🛒 *PANIER* pour voir | *VALIDER* pour commander`
    )
    return
  }

  // CMD command — add to cart with optional quantity
  if (msg.startsWith('cmd ')) {
    const parts = msg.split(' ')
    const productId = parts[1]?.trim()
    const qty = Math.min(Math.max(parseInt(parts[2] ?? '1') || 1, 1), 10) // clamp 1-10
    const product = products.find((p) => p.id === productId)
    if (!product) {
      await sendWhatsAppText(
        phone,
        '❌ Produit introuvable. Tapez *1* pour le catalogue.'
      )
      return
    }
    const cart = safeParseCart(session?.cart)
    const existing = cart.find((i) => i.productId === productId)
    if (existing) existing.quantity = Math.min(existing.quantity + qty, 10)
    else cart.push({ productId, quantity: qty })
    await updateSession(phone, 'cart', { cart: JSON.stringify(cart) })
    await sendWhatsAppText(
      phone,
      `✅ *${product.name}* ×${qty} ajouté !\n💰 ${formatPrice(product, country)}\n\n🛒 *PANIER* — voir\n🗑️ *VIDER* — vider\n🗑️ *SUPPR ${productId}* — retirer\n✅ *VALIDER* — commander\n1️⃣ — continuer\n0️⃣ — menu`
    )
    return
  }

  // Reset global
  if (['menu', 'retour', '0', 'restart'].includes(msg)) {
    await sendWhatsAppText(
      phone,
      `🏠 *Menu Makiné :*\n\n1️⃣ Catalogue\n2️⃣ Commander\n3️⃣ Suivre commande\n4️⃣ Vente en gros\n5️⃣ Contact`
    )
    await updateSession(phone, 'menu')
    return
  }

  // Greeting
  if (
    !session ||
    session.state === 'greeting' ||
    ['bonjour', 'salut', 'hi', 'hello', 'bonsoir'].includes(msg)
  ) {
    await sendWhatsAppText(
      phone,
      `👋 Bienvenue chez *Makiné* ✨\n_"L'élégance commence par une peau douce"_\n\n` +
        `1️⃣ Catalogue produits\n2️⃣ Passer une commande\n3️⃣ Suivre ma commande\n` +
        `4️⃣ Vente en gros 💼\n5️⃣ Service client\n\n_Tapez le numéro de votre choix_`
    )
    await updateSession(phone, 'menu', { country })
    return
  }

  // Panier
  if (msg === 'panier') {
    const cart = safeParseCart(session?.cart)
    if (!cart.length) {
      await sendWhatsAppText(
        phone,
        '🛒 Panier vide. Tapez *1* pour le catalogue.'
      )
      return
    }
    let recap = '🛒 *Votre panier :*\n\n'
    let total = 0
    for (const item of cart) {
      const p = products.find((pr) => pr.id === item.productId)!
      const price = country === 'SN' ? p.priceXOF : p.price
      recap += `• *${p.name}* x${item.quantity} — ${(price * item.quantity).toLocaleString('fr-FR')} ${country === 'SN' ? 'FCFA' : '€'}\n`
      total += price * item.quantity
    }
    recap += `\n💰 *Total : ${total.toLocaleString('fr-FR')} ${country === 'SN' ? 'FCFA' : '€'}*\n\n✅ *VALIDER* | 🗑️ *VIDER*`
    await sendWhatsAppText(phone, recap)
    return
  }

  if (msg === 'vider') {
    await updateSession(phone, 'menu', { cart: '[]' })
    await sendWhatsAppText(phone, '🗑️ Panier vidé.')
    return
  }

  // Checkout — start
  if (msg === 'valider') {
    const cart = safeParseCart(session?.cart)
    if (!cart.length) {
      await sendWhatsAppText(phone, '🛒 Panier vide.')
      return
    }
    await sendWhatsAppText(
      phone,
      `📋 *Finaliser la commande*\nÉtape 1/4 — Envoyez votre *prénom et nom* :`
    )
    await updateSession(phone, 'checkout_name')
    return
  }

  // Menu
  if (session.state === 'menu') {
    if (msg === '1') {
      await sendWhatsAppText(
        phone,
        `🛍️ *Nos catégories :*\n\n1️⃣ Gammes corporelles 🎁\n2️⃣ Soins 💆\n3️⃣ Huiles ✨\n4️⃣ Savons 🧼\n0️⃣ Retour`
      )
      await updateSession(phone, 'catalogue')
    } else if (msg === '2') {
      await sendWhatsAppText(
        phone,
        `🛒 *Commander directement*\n\nTapez *CMD [id] [quantité]* pour ajouter un produit.\nEx: *CMD p11* ou *CMD p11 2*\n\nOu tapez *1* pour voir le catalogue avec photos.\n\n🛒 *PANIER* — voir votre panier\n✅ *VALIDER* — finaliser commande\n0️⃣ Menu principal`
      )
    } else if (msg === '3') {
      // Order tracking
      const orders = await prisma.order.findMany({
        where: { customerPhone: { contains: phone.slice(-9) } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { items: { include: { product: true } } },
      })
      if (!orders.length) {
        await sendWhatsAppText(
          phone,
          '📭 Aucune commande trouvée pour ce numéro.\nTapez *1* pour commander.'
        )
        return
      }
      let orderMsg = '📦 *Vos commandes :*\n\n'
      for (const o of orders) {
        const statusEmoji =
          ({ new: '🆕', confirmed: '✅', shipped: '🚚', delivered: '🎉', cancelled: '❌' } as Record<string, string>)[o.status] ?? '⏳'
        const payEmoji = o.paymentStatus === 'paid' ? '💚 Payé' : '🔴 En attente'
        const total =
          o.currency === 'XOF'
            ? `${o.totalAmount.toLocaleString('fr-FR')} FCFA`
            : `${o.totalAmount.toFixed(2)} €`
        orderMsg += `${statusEmoji} *Réf ${o.id.slice(-8).toUpperCase()}*\n📅 ${new Date(o.createdAt).toLocaleDateString('fr-FR')}\n💰 ${total} — ${payEmoji}\n🛍️ ${o.items.map((i) => `${i.product.name}×${i.quantity}`).join(', ')}\n\n`
      }
      orderMsg += '0️⃣ Menu principal'
      await sendWhatsAppText(phone, orderMsg)
      await updateSession(phone, 'menu')
    } else if (msg === '4') {
      await sendWhatsAppText(
        phone,
        `💼 *Vente en gros Makiné*\n\nTarifs revendeurs disponibles.\n📞 SN: +221 71 058 17 11\n📞 FR: +33 7 61 78 36 12\n📧 fatimata6590@gmail.com`
      )
    } else if (msg === '5') {
      await sendWhatsAppText(
        phone,
        `📞 *Service Client*\n• 🇫🇷 +33 7 61 78 36 12\n• 🇸🇳 +221 71 058 17 11\n• fatimata6590@gmail.com\n• 📍 Thiès, Parcelle Assainie Unité 3\nHoraires : 8h-20h 🕗`
      )
    }
    return
  }

  // Catalogue
  if (session.state === 'catalogue') {
    const catMap: Record<string, string> = {
      '1': 'gamme',
      '2': 'soins',
      '3': 'huile',
      '4': 'savon',
    }
    const cat = catMap[msg]
    if (cat) {
      const filtered = products.filter((p) => p.category === cat && p.inStock)
      for (const p of filtered.slice(0, 5)) {
        const badge = p.badge ? `[${p.badge}] ` : ''
        const contents = p.contents?.length
          ? `\n_${p.contents.join(', ')}_`
          : ''
        await sendWhatsAppImage(
          phone,
          getProductImageUrl(p.slug),
          `${badge}*${p.name}*\n${p.description}${contents}\n💰 ${formatPrice(p, country)}\n_→ *CMD ${p.id}* pour commander_`
        )
        await new Promise((r) => setTimeout(r, 500))
      }
      await sendWhatsAppText(
        phone,
        `\nTapez *CMD [id]* pour commander\nEx: *CMD p11* ou *CMD p11 2*\n0️⃣ Retour`
      )
      await updateSession(phone, 'product')
    }
    return
  }

  // Checkout — name
  if (session?.state === 'checkout_name') {
    await sendWhatsAppText(
      phone,
      `Merci *${params.body.trim()}* 👌\nÉtape 2/4 — *Numéro de téléphone de livraison* :`
    )
    await updateSession(phone, 'checkout_phone', {
      customerName: params.body.trim(),
    })
    return
  }

  // Checkout — phone
  if (session?.state === 'checkout_phone') {
    await sendWhatsAppText(
      phone,
      `📞 Numéro : *${params.body.trim()}*\n\nÉtape 3/4 — *Adresse de livraison* (ou tapez *PASS* pour passer) :`
    )
    await updateSession(phone, 'checkout_address', {
      customerPhone: params.body.trim(),
    })
    return
  }

  // Checkout — address
  if (session?.state === 'checkout_address') {
    const addressInput = params.body.trim()
    const address = addressInput.toLowerCase() === 'pass' ? '' : addressInput
    const cart = safeParseCart(session?.cart)
    const total = await calcTotal(cart, country)
    const totalLabel =
      country === 'SN'
        ? `${total.toLocaleString('fr-FR')} FCFA`
        : `${total.toFixed(2)} €`
    const addressLine = address ? `📍 Adresse : *${address}*\n` : ''
    await sendWhatsAppText(
      phone,
      `${addressLine}💰 Total : *${totalLabel}*\n\nÉtape 4/4 — 💳 *Mode de paiement :*\n1️⃣ Wave 💙\n2️⃣ Orange Money 🟠`
    )
    await updateSession(phone, 'payment', { address })
    return
  }

  // Paiement
  if (session?.state === 'payment' && (msg === '1' || msg === '2')) {
    const cart = safeParseCart(session?.cart)
    const totalXOF = await calcTotal(cart, 'SN')
    const sessionAddress = (session as unknown as { address?: string }).address
    const order = await prisma.order.create({
      data: {
        customerName: session.customerName ?? 'Client',
        customerPhone: session.customerPhone ?? phone,
        country,
        currency: 'XOF',
        totalAmount: totalXOF,
        paymentMethod: msg === '1' ? 'wave' : 'orange_money',
        paymentStatus: 'pending',
        address: sessionAddress ?? undefined,
        items: {
          create: cart.map(
            (item: { productId: string; quantity: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
              price:
                products.find((p) => p.id === item.productId)?.priceXOF ?? 0,
            })
          ),
        },
      },
      include: { items: { include: { product: true } } },
    })

    // Notify admin
    await notifyAdmin(order).catch((err) => console.error('[Bot notifyAdmin]', err))

    if (msg === '1') {
      try {
        const checkout = await createWaveCheckout({
          amount: totalXOF,
          currency: 'XOF',
          error_url: `${APP_URL}/order/failed?id=${order.id}`,
          success_url: `${APP_URL}/order/${order.id}/success`,
          client_reference: order.id,
        })
        await sendWhatsAppText(
          phone,
          `💙 *Paiement Wave*\n\nCliquez ici pour payer :\n${checkout.wave_launch_url}\n\n📦 Réf : *${order.id.slice(-8).toUpperCase()}*\n_Confirmation automatique après paiement_ ✅`
        )
      } catch (err) {
        console.error('[Bot Wave]', err)
        await sendWhatsAppText(
          phone,
          `❌ Erreur Wave. Contactez-nous : +221 71 058 17 11`
        )
      }
    } else {
      try {
        await initiateOrangeMoneyPayment({
          amount: totalXOF,
          currency: 'XOF',
          orderId: order.id,
          customerPhone: session.customerPhone ?? phone,
          description: 'Commande Makiné',
          notifUrl: `${APP_URL}/api/payment/orange-money/webhook`,
          returnUrl: `${APP_URL}/order/${order.id}/success`,
        })
        await sendWhatsAppText(
          phone,
          `🟠 *Paiement Orange Money*\n\nDemande envoyée sur votre téléphone.\nConfirmez *${totalXOF.toLocaleString('fr-FR')} FCFA* 📱\n📦 Réf : *${order.id.slice(-8).toUpperCase()}*`
        )
      } catch (err) {
        console.error('[Bot OM]', err)
        await sendWhatsAppText(
          phone,
          `❌ Erreur Orange Money. Contactez-nous : +221 71 058 17 11`
        )
      }
    }
    await updateSession(phone, 'waiting', { cart: '[]' })
    return
  }

  // Fallback
  await sendWhatsAppText(
    phone,
    `🤔 Je n'ai pas compris.\nTapez *0* pour le menu, *1* pour le catalogue ou *AIDE* pour la liste des commandes.`
  )
}

export async function sendOrderConfirmation(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  })
  if (!order) return

  let msg = `✅ *Commande Makiné confirmée !* 🎉\n📦 Réf : *${order.id.slice(-8).toUpperCase()}*\n👤 ${order.customerName}\n\n*Articles :*\n`
  for (const item of order.items) {
    const price =
      order.currency === 'XOF'
        ? `${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA`
        : `${(item.price * item.quantity).toFixed(2)} €`
    msg += `• ${item.product.name} x${item.quantity} — ${price}\n`
  }
  const total =
    order.currency === 'XOF'
      ? `${order.totalAmount.toLocaleString('fr-FR')} FCFA`
      : `${order.totalAmount.toFixed(2)} €`
  msg += `\n💰 *Total : ${total}*\n💳 ${order.paymentMethod === 'wave' ? 'Wave 💙' : 'Orange Money 🟠'}\n\n🚚 Livraison partout au Sénégal & Europe\n📞 +221 71 058 17 11\nMerci ! *Makiné* 🌸`

  await sendWhatsAppText(order.customerPhone, msg)
  await prisma.order.update({
    where: { id: orderId },
    data: { whatsappSent: true },
  })
}
