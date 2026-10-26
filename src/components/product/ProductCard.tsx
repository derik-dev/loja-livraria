'use client'

import Link from 'next/link'
import { Product } from '@/lib/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/brand'
import { useCartStore } from '@/store/cartStore'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/context/AuthContext'
import { BookImage } from '@/components/zine'

interface ProductCardProps {
  product: Product
  /** Mantido por compatibilidade com telas antigas; o cartão é sempre reto. */
  tilt?: number
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { user, openAuthModal } = useAuth()
  const wishlisted = isWishlisted(product.id)
  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : null
  const freeShipping = product.price >= FREE_SHIPPING_THRESHOLD

  return (
    <div className="bk-card bk-card-hover bk-lift group relative flex h-full flex-col overflow-hidden">
      <Link
        href={`/produto/${product.slug}`}
        className="relative flex items-center justify-center bg-[var(--bk-paper)]/70 px-8 py-6"
        style={{ aspectRatio: '1 / 1' }}
      >
        <div className="bk-cover h-full overflow-hidden" style={{ aspectRatio: '2 / 3' }}>
          <BookImage src={product.images[0]} title={product.name} className="h-full w-full object-cover" />
        </div>

        {product.featured && (
          <span className="absolute left-0 top-3 rounded-r bg-[var(--bk-gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
            Destaque
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault()
            toggleWishlist(product.id)
          }}
          aria-label={wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition-colors hover:text-[var(--bk-red)]"
          style={{ color: wishlisted ? 'var(--bk-red)' : 'var(--bk-ink-soft)' }}
        >
          <svg className="h-[18px] w-[18px]" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </Link>

      <div className="flex flex-1 flex-col border-t border-[var(--bk-paper-2)] p-4">
        {product.originalPrice && (
          <p className="text-[13px] text-zinc-400 line-through">{formatCurrency(product.originalPrice)}</p>
        )}
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[1.45rem] font-medium leading-tight text-[var(--bk-ink)]">{formatCurrency(product.price)}</span>
          {discount && <span className="text-[13px] font-semibold text-[var(--bk-green)]">{discount}% OFF</span>}
        </div>
        {freeShipping && <p className="mt-0.5 text-[13px] font-semibold text-[var(--bk-green)]">Frete grátis</p>}

        <Link href={`/produto/${product.slug}`} className="mt-2">
          <h3 className="z-plain line-clamp-2 text-[14px] font-normal leading-snug text-[var(--bk-ink)]/85 transition-colors group-hover:text-[var(--bk-navy-2)]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-3">
          {product.reviewCount > 0 && (
            <p className="text-[12px] text-[var(--bk-ink-soft)]">
              <span className="text-[var(--bk-gold)]">★</span> {product.rating}
              <span className="ml-1 text-zinc-400">({product.reviewCount.toLocaleString('pt-BR')})</span>
            </p>
          )}
          {product.stock > 0 && product.stock <= 3 && (
            <p className="text-[12px] font-semibold text-[var(--bk-red)]">Últimas unidades</p>
          )}
        </div>

        <button
          onClick={() => {
            if (product.stock === 0) return
            if (!user) { openAuthModal(); return }
            addItem(product)
          }}
          disabled={product.stock === 0}
          className="bk-btn bk-btn--soft mt-3 w-full !py-2.5 !text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {product.stock === 0 ? 'Esgotado' : 'Adicionar à sacola'}
        </button>
      </div>
    </div>
  )
}
