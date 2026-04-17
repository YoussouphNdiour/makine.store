/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Les images produits sont locales (/images/products/*.jpg)
    // Aucun domaine externe requis
  },
}
module.exports = nextConfig
