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
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="z-card relative mx-auto inline-block -rotate-2 bg-[var(--z-pink)] px-10 py-8">
          <h1 className="z-display text-5xl">Carrinho vazio</h1>
          <p className="z-hand text-3xl">nenhum livro na sacola</p>
        </div>
        <p className="mb-8 mt-8 text-base font-medium">Dá uma volta pelas estantes, a gente espera.</p>
        <Link href="/produtos" className="z-btn z-btn--ink">Explorar livros →</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="z-hand text-2xl">conferindo a sacola</p>
        <h1 className="z-display text-[clamp(2.4rem,6vw,4.5rem)]">Meu carrinho</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="border-[3px] border-[var(--z-ink)] bg-[#fffdf6] p-5 shadow-[8px_8px_0_var(--z-ink)]">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="z-plain text-sm font-bold uppercase tracking-[0.14em]">
                {items.length} {items.length === 1 ? 'livro' : 'livros'}
              </h2>
              <button onClick={clearCart} className="text-xs font-bold underline underline-offset-4 hover:text-[var(--z-red)]">
                Esvaziar
              </button>
            </div>
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-28 border-[3px] border-[var(--z-ink)] bg-[var(--z-yellow)] p-6 shadow-[8px_8px_0_var(--z-ink)]">
            <h2 className="z-display mb-5 text-3xl">Resumo</h2>

            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-bold">{shipping === 0 ? 'Grátis' : formatCurrency(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="border-2 border-dashed border-[var(--z-ink)] bg-[var(--z-paper)] p-2.5 text-xs font-bold">
                  Faltam {formatCurrency(FREE_SHIPPING_THRESHOLD - total)} pro frete grátis!
                </p>
              )}
              <div className="flex justify-between border-t-[3px] border-[var(--z-ink)] pt-4">
                <span className="z-display text-xl">Total</span>
                <span className="z-display text-2xl">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link href="/checkout" className="z-btn z-btn--red w-full !py-4 !text-base">Finalizar compra →</Link>
              <Link href="/produtos" className="z-btn z-btn--paper w-full !text-sm">Continuar comprando</Link>
            </div>

            <p className="mt-5 text-center text-xs font-bold">Pagamento por Pix, com 2% off.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
