'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import ProductCard from './ProductCard'

interface Props {
  products: Product[]
  title?: string
  href?: string
  linkLabel?: string
}

/** Painel branco com carrossel horizontal de livros (estilo vitrine de marketplace). */
export default function ProductShowcase({
  products: rawProducts,
  title = 'Chegaram à estante',
  href = '/produtos',
  linkLabel = 'Ver o catálogo completo',
}: Props) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const products = rawProducts.slice(0, 12)

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows)
    updateArrows()
    return () => el.removeEventListener('scroll', updateArrows)
  }, [rawProducts])

  function scrollBy(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 680 : -680, behavior: 'smooth' })
  }

  const arrowBtn = (dir: 'left' | 'right') => (
    <button
      key={dir}
      onClick={() => scrollBy(dir)}
      className="absolute top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgb(20_40_75/0.3)] transition-colors hover:text-[var(--bk-gold)] lg:flex"
      style={{ [dir === 'left' ? 'left' : 'right']: '-12px' }}
      aria-label={dir === 'left' ? 'Anterior' : 'Próximo'}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  )

  return (
    <section className="px-4 pt-4 sm:px-6">
      <div className="bk-card mx-auto max-w-[1200px] p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="z-plain text-xl font-semibold">{title}</h2>
          <Link href={href} className="bk-link text-sm font-medium">{linkLabel}</Link>
        </div>

        {products.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--bk-ink-soft)]">Arrumando as estantes…</p>
        ) : (
          <div className="relative mt-5">
            {canScrollLeft && arrowBtn('left')}
            {canScrollRight && arrowBtn('right')}
            <div ref={scrollRef} className="bk-noscroll flex gap-4 overflow-x-auto pb-2">
              {products.map((product) => (
                <div key={product.id} className="w-[210px] flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
