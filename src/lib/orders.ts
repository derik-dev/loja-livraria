import type { User } from '@supabase/supabase-js'
import type { CartItem } from '@/lib/types'
import { supabase } from '@/lib/supabase'

const CARRIERS: Record<string, string> = { sedex: 'SEDEX — Correios', pac: 'PAC — Correios', gratis: 'Correios' }

/** Grava o pedido (o pagamento é simulado: não existe cobrança real). Devolve o número do pedido. */
export async function placeOrder(input: {
  items: CartItem[]
  total: number
  user: User | null
  email: string
  shippingId?: string | null
}) {
  const { items, total, user, email, shippingId } = input
  const first = items[0]?.product.name ?? 'Produto'
  const productLabel = items.length > 1 ? `${first} + ${items.length - 1} outro${items.length > 2 ? 's' : ''}` : first
  const orderId = `#${Math.floor(10000 + Math.random() * 90000)}`

  const { error } = await supabase.from('orders').insert({
    id: orderId,
    user_id: user?.id ?? null,
    customer_name: user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Cliente',
    customer_email: user?.email ?? email,
    product_name: productLabel,
    items: items.reduce((sum, i) => sum + i.quantity, 0),
    total,
    status: 'Novo',
    carrier: (shippingId && CARRIERS[shippingId]) || null,
  })

  if (error) console.error('[Checkout] erro ao salvar pedido:', error)
  return orderId
}
