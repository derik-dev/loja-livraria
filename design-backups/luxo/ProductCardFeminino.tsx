'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/context/AuthContext'

export default function ProductCardFeminino({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { user, openAuthModal } = useAuth()
  const wishlisted = isWishlisted(product.id)

  const [first, second] = product.images
  const soldOut = product.stock === 0

  const badges: string[] = []
  if (product.section?.includes('novidades')) badges.push('Novo')
  if (product.stock > 0 && product.stock <= 3) badges.push('Últimas peças')

  return (
    <article className="group relative flex flex-col">
      <Link
        href={`/produto/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-[var(--theme-soft-1)]"
      >
        {first && (
          <Image
            src={first}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className={`object-cover transition-opacity duration-700 ${second ? 'group-hover:opacity-0' : ''}`}
          />
        )}
        {second && (
          <Image
            src={second}
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}

        {badges.length > 0 && (
          <div className="absolute left-0 top-4 flex flex-col items-start gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className="fem-caps bg-[var(--theme-surface)] px-3 py-1.5 text-[10px] text-[var(--theme-ink)]"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </Link>

      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-label={wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        aria-pressed={wishlisted}
        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-[var(--theme-night)] transition-colors hover:text-[var(--theme-rubi)]"
      >
        <svg className="h-5 w-5 drop-shadow-[0_0_6px_rgb(255_255_255_/_0.6)]" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>

      <div className="mt-5 flex flex-1 flex-col gap-2">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="fem-sans text-[0.95rem] font-normal leading-snug text-[var(--theme-ink)] line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="flex items-baseline gap-3">
          <span className="text-base font-medium text-[var(--theme-ink)]">{formatCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-[var(--theme-ink-soft)] line-through">{formatCurrency(product.originalPrice)}</span>
          )}
        </p>

        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            if (soldOut) return
            if (!user) { openAuthModal(); return }
            addItem(product)
          }}
          className="fem-link fem-caps mt-2 w-fit py-2 text-[var(--theme-ink)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {soldOut ? 'Esgotado' : 'Adicionar'}
        </button>
      </div>
    </article>
  )
}
