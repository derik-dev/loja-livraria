'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'
import CartItem from '@/components/cart/CartItem'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/brand'

export default function CarrinhoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const clearCart = useCartStore((s) => s.clearCart)

  const shipping = total > 0 && total >= FREE_SHIPPING_THRESHOLD ? 0 : total > 0 ? 19.9 : 0
  const finalTotal = total + shipping

  if (items.length === 0) {
    return (
      <div data-tone="light" className="bg-bg px-4 py-24 text-center">
        <div className="surface mx-auto max-w-md px-10 py-10">
          <h1 className="text-3xl text-ink">Sua sacola está vazia</h1>
          <p className="mt-2 text-sm text-muted">Dá uma volta pelas estantes, a gente espera.</p>
          <Link href="/produtos" className="btn-primary mt-6">Explorar livros</Link>
        </div>
      </div>
    )
  }

  return (
    <div data-tone="light" className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-14">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Conferindo a sacola</p>
          <h1 className="mt-1.5 text-3xl text-ink md:text-4xl">Meu carrinho</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="surface p-5 md:p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted">
                {items.length} {items.length === 1 ? 'livro' : 'livros'}
              </h2>
              <button onClick={clearCart} className="text-xs font-semibold text-accent underline-offset-4 hover:underline">
                Esvaziar
              </button>
            </div>
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>

          <aside data-tone="dark" className="surface h-fit p-6 lg:sticky lg:top-6">
            <h2 className="mb-5 text-2xl text-ink">Resumo</h2>

            <div className="space-y-3 text-sm text-ink">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Frete</span>
                <span className="font-semibold">{shipping === 0 ? 'Grátis' : formatCurrency(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="rounded-lg border border-border bg-bg-alt p-3 text-xs text-muted">
                  Faltam <strong className="text-accent">{formatCurrency(FREE_SHIPPING_THRESHOLD - total)}</strong> para o frete grátis.
                </p>
              )}
              <div className="flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-base font-semibold">Total</span>
                <span className="text-2xl font-semibold">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link href="/checkout" className="btn-primary w-full !min-h-[52px]">Finalizar compra</Link>
              <Link href="/produtos" className="btn-outline w-full">Continuar comprando</Link>
            </div>

            <p className="mt-5 text-center text-xs text-muted">Pagamento por Pix, com 2% off.</p>
          </aside>
        </div>
      </div>
    </div>
  )
}
