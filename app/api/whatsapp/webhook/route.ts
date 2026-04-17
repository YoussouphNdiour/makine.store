import { validateWASenderWebhook } from '@/lib/whatsapp'
import { processWhatsAppMessage } from '@/lib/whatsappBot'

// Payload WaSenderAPI reçu :
// {
//   event: "messages.received",
//   timestamp: 1633456789,
//   data: {
//     messages: {
//       key: { id: "3EB0X...", fromMe: false, remoteJid: "221XXXXXXXX@s.whatsapp.net", cleanedSenderPn: "221XXXXXXXX" },
//       messageBody: "Bonjour"
//     }
//   }
// }

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    // Vérification signature
    if (!validateWASenderWebhook(req.headers.get('x-wasender-secret') ?? '')) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const event: string = payload.event ?? ''

    // Écouter les messages entrants seulement
    const isMessageEvent = [
      'messages.received',
      'messages.personal.received',
      'messages.upsert',
    ].includes(event)

    if (isMessageEvent) {
      const messages = payload.data?.messages

      // Ignorer les messages qu'on a envoyé nous-mêmes
      if (messages?.key?.fromMe === true) {
        return Response.json({ ok: true, skipped: 'fromMe' })
      }

      // Extraire les champs selon le vrai format WaSenderAPI
      const from: string =
        messages?.key?.remoteJid ??     // format: "221XXXXXXXX@s.whatsapp.net"
        messages?.key?.cleanedSenderPn ?? // format: "221XXXXXXXX"
        payload.data?.from ?? ''

      const body: string =
        messages?.messageBody ??
        messages?.message?.conversation ??
        payload.data?.body ?? ''

      const messageId: string = messages?.key?.id ?? payload.data?.id ?? ''

      if (from && body) {
        // Traitement async — on répond 200 immédiatement à WaSender
        processWhatsAppMessage({ from, body, messageId }).catch(console.error)
      }
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[Webhook WA]', err)
    return Response.json({}, { status: 500 })
  }
}
