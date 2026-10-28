'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/context/AuthContext'
import { BookImage } from '@/components/zine'
import { getMockCategoryLabel } from '@/lib/data/products'

interface ProductCardProps {
  product: Product
  /** Mantido por compatibilidade com telas antigas; o card é sempre reto. */
  tilt?: number
  /** Só o primeiro card visível da página deve usar priority. */
  priority?: boolean
  sizes?: string
  /** `flat`: sem moldura, capa grande e texto solto embaixo (carrosséis da home). */
  variant?: 'card' | 'flat'
}

/** Card de livro reutilizável: capa 2:3, preço em destaque, selo de desconto e ação principal. */
export default function ProductCard({ product, priority = false, sizes, variant = 'card' }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { user } = useAuth()
  const wishlisted = isWishlisted(product.id)
  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : null
  const soldOut = product.stock === 0
  const flat = variant === 'flat'

  return (
    <article className={flat ? 'group relative flex h-full flex-col' : 'surface surface-lift group relative flex h-full flex-col p-3 motion-safe:hover:-translate-y-0.5'}>
      <div className="relative">
        <Link
          href={`/produto/${product.slug}`}
          className={`relative block aspect-[2/3] overflow-hidden bg-card-hover ${flat ? 'rounded-sm' : 'rounded-lg'}`}
          aria-label={`Ver ${product.name}`}
          data-cursor="Ver"
        >
          <BookImage src={product.images[0]} title={product.name} priority={priority} sizes={sizes} />
        </Link>

        {discount && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold leading-none text-on-accent shadow-sm">-{discount}%</span>
        )}

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? `Remover ${product.name} dos favoritos` : `Adicionar ${product.name} aos favoritos`}
          aria-pressed={wishlisted}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-bg/80 text-ink backdrop-blur transition-colors hover:text-accent"
        >
          <svg className="h-[18px] w-[18px]" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      <div className={`flex flex-1 flex-col ${flat ? 'mt-3' : 'mt-4 px-1'}`}>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{getMockCategoryLabel(product.category)}</p>
        <Link href={`/produto/${product.slug}`} className="mt-1 focus-visible:rounded">
          <h3 className="z-plain line-clamp-2 text-[15px] font-medium leading-snug text-ink">{product.name}</h3>
        </Link>
        {product.author && <p className="mt-1 truncate text-[13px] text-muted">{product.author}</p>}

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xl font-semibold text-ink">{formatCurrency(product.price)}</span>
          {product.originalPrice && <span className="text-[13px] text-muted line-through">{formatCurrency(product.originalPrice)}</span>}
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={() => {
              if (soldOut) return
              if (!user) {
                router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)
                return
              }
              addItem(product)
            }}
            disabled={soldOut}
            className={flat ? 'btn-outline w-full' : 'btn-primary w-full'}
          >
            {soldOut ? 'Esgotado' : 'Adicionar à sacola'}
          </button>
        </div>
      </div>
    </article>
  )
}
