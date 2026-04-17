// Toutes les images sont locales : /images/products/${slug}.jpg
// Les entrées explicites ci-dessous surchargent le fallback si nécessaire.
export const productImages: Record<string, string> = {}

export function getProductImageUrl(slug: string): string {
  return productImages[slug] ?? `/images/products/${slug}.jpg`
}
