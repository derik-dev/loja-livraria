'use client'

import { useEffect, useRef, useState } from 'react'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/product/ProductCard'

/** Carrossel horizontal de livros: scroll-snap no toque, setas no desktop. */
export default function BookCarousel({ books, label }: { books: Product[]; label: string }) {
  const ref = useRef<HTMLUListElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      setCanLeft(el.scrollLeft > 8)
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [books])

  function scroll(dir: 1 | -1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  const arrow = 'absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-bg/90 text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent md:flex'

  return (
    <div className="relative" role="region" aria-label={label}>
      {canLeft && (
        <button type="button" onClick={() => scroll(-1)} aria-label="Ver anteriores" className={`${arrow} -left-3`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {canRight && (
        <button type="button" onClick={() => scroll(1)} aria-label="Ver próximos" className={`${arrow} -right-3`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}

      <ul ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:mx-0 md:px-0">
        {books.map((book) => (
          <li key={book.id} className="w-[72%] shrink-0 snap-start sm:w-[280px]">
            <ProductCard product={book} sizes="(min-width: 640px) 280px, 72vw" />
          </li>
        ))}
      </ul>
    </div>
  )
}
