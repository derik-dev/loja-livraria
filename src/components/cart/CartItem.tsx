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
    <div className="flex gap-4 border-b border-border py-4 last:border-0">
      <div className="relative h-[104px] w-[70px] flex-shrink-0 overflow-hidden rounded-sm bg-card-hover ring-1 ring-border">
        <BookImage src={item.product.images[0]} title={item.product.name} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{item.product.name}</p>
            {item.product.author && <p className="mt-0.5 text-xs text-muted">{item.product.author}</p>}
            {subtitle && <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={() => removeItem(item.product.id)}
            aria-label="Remover item"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border-strong text-sm text-muted transition-colors hover:border-accent hover:text-accent"
          >
            ×
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="inline-flex items-center rounded-full border border-border-strong bg-card">
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              aria-label="Diminuir quantidade"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-card-hover"
            >
              −
            </button>
            <span className="w-7 text-center text-xs font-semibold text-ink">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              aria-label="Aumentar quantidade"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-card-hover"
            >
              +
            </button>
          </div>

          <p className="text-base font-semibold text-ink">{formatCurrency(item.product.price * item.quantity)}</p>
        </div>
      </div>
    </div>
  )
}
