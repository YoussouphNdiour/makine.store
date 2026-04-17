import { PrismaClient } from '@prisma/client'
import { products } from '../data/products'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding products...')
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        priceXOF: p.priceXOF,
        priceXOF2: p.priceXOF2 ?? null,
        category: p.category,
        badge: p.badge ?? null,
        inStock: p.inStock,
        wholesale: p.wholesale,
      },
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        priceXOF: p.priceXOF,
        priceXOF2: p.priceXOF2 ?? null,
        category: p.category,
        badge: p.badge ?? null,
        inStock: p.inStock,
        wholesale: p.wholesale,
      },
    })
    console.log(`  ✓ ${p.name}`)
  }
  console.log(`Seeded ${products.length} products.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
