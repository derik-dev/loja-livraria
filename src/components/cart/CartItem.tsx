'use client'

import { CartItem as CartItemType } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { BookImage } from '@/components/zine'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const subtitle = [item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')

  return (
    <div className="flex gap-4 border-b-2 border-dashed border-[var(--z-ink)]/40 py-4 last:border-0">
      <div className="h-[104px] w-[70px] flex-shrink-0 overflow-hidden border-[3px] border-[var(--z-ink)] bg-[var(--z-paper-2)] shadow-[4px_4px_0_var(--z-ink)]">
        <BookImage src={item.product.images[0]} title={item.product.name} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-bold leading-snug">{item.product.name}</p>
            {subtitle && <p className="mt-0.5 text-[11px] font-medium text-zinc-500">{subtitle}</p>}
          </div>
          <button
            onClick={() => removeItem(item.product.id)}
            aria-label="Remover item"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--z-ink)] bg-card text-sm font-bold hover:bg-[var(--z-red)] hover:text-[#fff9ea]"
          >
            ×
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="inline-flex items-center border-2 border-[var(--z-ink)] bg-card">
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              aria-label="Diminuir quantidade"
              className="flex h-7 w-7 items-center justify-center font-bold hover:bg-[var(--z-yellow)]"
            >
              −
            </button>
            <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              aria-label="Aumentar quantidade"
              className="flex h-7 w-7 items-center justify-center font-bold hover:bg-[var(--z-yellow)]"
            >
              +
            </button>
          </div>

          <p className="z-display text-base">{formatCurrency(item.product.price * item.quantity)}</p>
        </div>
      </div>
    </div>
  )
}
