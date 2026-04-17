/**
 * config.ts — Constantes métier centralisées
 * Modifier ici plutôt que dans chaque fichier.
 */

export const CONTACT = {
  /** WhatsApp principal (Sénégal) */
  WA_SN: '+221710581711',
  /** WhatsApp commandes (numéro boutique) */
  WA_ORDERS: '+221784715757',
  /** Téléphone Sénégal (voix) */
  TEL_SN: '+221710581711',
  /** Téléphone France */
  TEL_FR: '+33761783612',
  /** Email */
  EMAIL: 'fatimata6590@gmail.com',
  /** TikTok */
  TIKTOK: 'https://www.tiktok.com/@makineparis',
  /** Instagram */
  INSTAGRAM: 'https://www.instagram.com/makine.store',
}

/** Parité fixe XOF/EUR (zone franc CFA) */
export const EUR_TO_XOF = 655.957

/** Numéro WhatsApp pour les messages de commande (sans le +) */
export const WA_ORDER_NUMBER = '221784715757'
/** Numéro WhatsApp pour le service client (sans le +) */
export const WA_SUPPORT_NUMBER = '221710581711'

/**
 * Construit un lien WhatsApp avec message pré-rempli.
 */
export function waLink(message: string, number = WA_SUPPORT_NUMBER): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
