export const productImages: Record<string, string> = {
  "pearl-skin-lp":      "https://makine.store/web/image/product.product/3/image_1024/Pearl%20Skin%20LP",
  "creme-chantilly":    "https://makine.store/web/image/product.template/46/image_1024/Cr%C3%A8me%20chantilly",
  "huile-pearl-shine":  "https://makine.store/web/image/product.product/71/image_1024/Huile%20Pearl%20Shine",
  "ebony-lp":           "https://makine.store/web/image/product.product/72/image_1024/Ebony%20LP",
  "savon-candy-love":   "https://makine.store/web/image/product.product/73/image_1024/Savon%20Candy%20Love",
  "creme-visage":       "https://makine.store/web/image/product.product/74/image_1024/Cr%C3%A8me%20de%20visage",
  "savon-bronze-glow":  "https://makine.store/web/image/product.product/75/image_1024/Savon%20Bronze%20Glow",
  "gommage":            "https://makine.store/web/image/product.product/76/image_1024/Gommage",
  "savon-ebony":        "https://makine.store/web/image/product.product/77/image_1024/Savon%20Ebony",
  "savon-candy-pink":   "https://makine.store/web/image/product.template/61/image_1024/Savon%20Candy%20Pink",
  "gamme-teint-clair":  "https://makine.store/web/image/product.template/63/image_1024/Gamme%20Teint%20Clair",
  "gamme-teint-marron": "https://makine.store/web/image/product.template/64/image_1024/Gamme%20Teint%20Marron",
  "gamme-kinoush":      "https://makine.store/web/image/product.template/66/image_1024/Gamme%20Kinoush",
  "gamme-anti-acne":    "https://makine.store/web/image/product.template/67/image_1024/Gamme%20Anti%20Acn%C3%A9",
  "gamme-teint-noir":      "/images/products/gamme-teint-noir.jpg",
  "savon-wekh-tal":        "/images/products/savon-wekh-tal.jpg",
  "coffret-kinoush":       "/images/products/coffret-kinoush.jpg",
  "coffret-pearl-skin":    "/images/products/coffret-pearl-skin.jpg",
}

export function getProductImageUrl(slug: string): string {
  return productImages[slug] ?? `/images/products/${slug}.jpg`
}
