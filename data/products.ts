export type Product = {
  id: string
  slug: string
  name: string
  category: 'gamme' | 'soins' | 'huile' | 'savon' | 'maquillage'
  price: number
  priceXOF: number
  priceXOF2?: number
  badge?: 'Nouveau' | 'Bestseller' | 'Pack' | 'Promo' | null
  description: string
  contents?: string[]
  inStock: boolean
  wholesale: boolean
}

export const products: Product[] = [
  {
    id: "p11", slug: "gamme-teint-clair", name: "Gamme Teint Clair",
    category: "gamme", price: 53.00, priceXOF: 35000, badge: "Pack",
    inStock: true, wholesale: true,
    description: "Pack unifiant peaux claires.",
    contents: ["Lait de corps", "Savon", "Crème mains & pieds", "Crème visage", "Huile"]
  },
  {
    id: "p12", slug: "gamme-teint-marron", name: "Gamme Teint Marron",
    category: "gamme", price: 27.50, priceXOF: 18000, badge: "Pack",
    inStock: true, wholesale: true,
    description: "Pack pour peaux bronzées et métissées.",
    contents: ["Lait de corps", "Savon", "Huile"]
  },
  {
    id: "p15", slug: "gamme-teint-noir", name: "Gamme Teint Noir",
    category: "gamme", price: 22.50, priceXOF: 15000, badge: "Pack",
    inStock: true, wholesale: true,
    description: "Pack formulé pour peaux noires.",
    contents: ["Lait de corps", "Savon", "Huile"]
  },
  {
    id: "p13", slug: "gamme-kinoush", name: "Gamme Kinoush",
    category: "gamme", price: 22.50, priceXOF: 15000, badge: "Pack",
    inStock: true, wholesale: true,
    description: "Routine beauté aux actifs naturels.",
    contents: ["Crème chantilly", "Gommage", "Brume"]
  },
  {
    id: "p14", slug: "gamme-anti-acne", name: "Pack Anti Acné",
    category: "gamme", price: 12.00, priceXOF: 8000, badge: "Pack",
    inStock: true, wholesale: false,
    description: "Pack ciblé anti-imperfections.",
    contents: ["Savon anti-acné", "Lotion"]
  },
  {
    id: "p2", slug: "creme-chantilly", name: "Crème Chantilly",
    category: "soins", price: 9.00, priceXOF: 6000, priceXOF2: 10000, badge: "Promo",
    inStock: true, wholesale: true,
    description: "Ultra-hydratante. Offre : 2 pour 10 000 FCFA."
  },
  {
    id: "p8", slug: "gommage", name: "Gommage",
    category: "soins", price: 9.90, priceXOF: 6500, priceXOF2: 12000, badge: "Promo",
    inStock: true, wholesale: true,
    description: "Exfoliant doux. Offre : 2 pour 12 000 FCFA."
  },
  {
    id: "p4", slug: "ebony-lp", name: "Ebony LP",
    category: "soins", price: 23.50, priceXOF: 15500, badge: "Bestseller",
    inStock: true, wholesale: true,
    description: "Soin unifiant pour peaux foncées, éclat intense."
  },
  {
    id: "p1", slug: "pearl-skin-lp", name: "Pearl Skin LP",
    category: "soins", price: 0, priceXOF: 0, badge: "Nouveau",
    inStock: true, wholesale: false,
    description: "Soin éclat pour une peau lumineuse et nacrée."
  },
  {
    id: "p6", slug: "creme-visage", name: "Crème de Visage",
    category: "soins", price: 0, priceXOF: 0, badge: "Nouveau",
    inStock: true, wholesale: false,
    description: "Hydratation longue durée."
  },
  {
    id: "p3", slug: "huile-pearl-shine", name: "Huile Pearl Shine",
    category: "huile", price: 3.50, priceXOF: 2300, badge: null,
    inStock: true, wholesale: true,
    description: "Soin corps soyeux et lumineux."
  },
  {
    id: "p16", slug: "savon-wekh-tal", name: "Savon Wekh Tal",
    category: "savon", price: 12.00, priceXOF: 8000, badge: "Nouveau",
    inStock: true, wholesale: true,
    description: "Soin intensif traditionnel."
  },
  {
    id: "p10", slug: "savon-candy-pink", name: "Savon Candy Pink",
    category: "savon", price: 10.50, priceXOF: 7000, badge: null,
    inStock: true, wholesale: true,
    description: "Hydratant, parfum fruité."
  },
  {
    id: "p9", slug: "savon-ebony", name: "Savon Ebony",
    category: "savon", price: 7.50, priceXOF: 5000, badge: null,
    inStock: true, wholesale: true,
    description: "Pour peaux noires, formule douce."
  },
  {
    id: "p5", slug: "savon-candy-love", name: "Savon Candy Love",
    category: "savon", price: 0, priceXOF: 0, badge: "Nouveau",
    inStock: true, wholesale: false,
    description: "Surgras parfumé, douceur extrême."
  },
  {
    id: "p7", slug: "savon-bronze-glow", name: "Savon Bronze Glow",
    category: "savon", price: 0, priceXOF: 0, badge: null,
    inStock: true, wholesale: false,
    description: "Bronzant naturel, hâle solaire."
  },
  {
    id: "p17", slug: "coffret-kinoush", name: "Coffret K'noush",
    category: "gamme", price: 0, priceXOF: 0, badge: "Nouveau",
    inStock: true, wholesale: false,
    description: "Coffret cadeau K'noush avec crème chantilly, gommage, brume corporelle, peluche, bombe de bain & bougie. Un moment de douceur et d'élégance.",
    contents: ["Crème Chantilly K'noush", "Gommage K'noush", "Brume Corporelle", "Peluche", "Bombe de bain", "Bougie"]
  },
  {
    id: "p18", slug: "coffret-pearl-skin", name: "Coffret Pearl Skin New Art",
    category: "gamme", price: 76.50, priceXOF: 50000, badge: "Nouveau",
    inStock: true, wholesale: false,
    description: "Coffret premium Pearl Skin — routine beauté complète avec lait de corps, savon, huile, gommage, peluche, bombe de bain & bougie.",
    contents: ["Lait de Corps Pearl Skin", "Savon Pearl Skin", "Huile", "Gommage", "Peluche", "Bombe de bain", "Bougie"]
  },
]
