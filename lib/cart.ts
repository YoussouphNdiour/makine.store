export type CartItem = { productId: string; quantity: number }

const CART_KEY = 'makine_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function setCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event('cart-updated'))
}

export function addToCart(productId: string, quantity = 1): CartItem[] {
  const cart = getCart()
  const existing = cart.find(i => i.productId === productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ productId, quantity })
  }
  setCart(cart)
  return cart
}

export function clearCart() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_KEY)
  window.dispatchEvent(new Event('cart-updated'))
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0)
}
