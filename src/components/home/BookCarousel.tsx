'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/product/ProductCard'
import { gsap, ScrollTrigger, useGSAP, MEDIA, scoped } from '@/lib/gsap'
import { onPreloaderDone } from '@/lib/preloader'

// Carrossel alinhado ao container da página que sangra só para a direita, até a borda da tela:
// o excesso é calc(50vw - 50%) (metade da tela menos metade do container), sem depender da largura máxima.
const BLEED = 'calc(50vw - 50%)'

/**
 * Carrossel horizontal de livros: scroll-snap no toque, setas no desktop.
 * `spread`: as capas começam empilhadas e se espalham quando o carrossel entra na tela.
 */
export default function BookCarousel({ books, label, spread = false, lead }: { books: Product[]; label: string; spread?: boolean; lead?: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
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

  // Pilha de livros que se espalha (só com animação permitida).
  useGSAP(
    () => {
      if (!spread || !wrap.current) return
      const mm = gsap.matchMedia()
      const run = () => {
        const items = gsap.utils.toArray<HTMLElement>('[data-spread]', wrap.current)
        if (items.length === 0) return
        const first = items[0]
        gsap.set(items, {
          x: (i: number) => -(items[i].offsetLeft - first.offsetLeft) + i * 7,
          y: (i: number) => (i % 2 ? 10 : -6),
          rotation: () => gsap.utils.random(-8, 8, 1),
          zIndex: (i: number) => items.length - i,
          transformOrigin: '50% 90%',
        })
        let undo = () => {}
        const cancel = onPreloaderDone(() => {
          undo = scoped(wrap.current, () => {
            ScrollTrigger.create({
              trigger: wrap.current,
              start: 'top 85%',
              once: true,
              onEnter: () =>
                gsap.to(items, { x: 0, y: 0, rotation: 0, duration: 1.1, ease: 'power3.out', stagger: 0.06, clearProps: 'zIndex' }),
            })
          })
        })
        return () => {
          cancel()
          undo()
        }
      }
      mm.add(`${MEDIA.full}, ${MEDIA.light}`, run)
    },
    { scope: wrap, dependencies: [spread, books.length] },
  )

  function scroll(dir: 1 | -1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  const arrow =
    'absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-bg/90 text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent md:flex'

  return (
    <div ref={wrap} className="relative" role="region" aria-label={label}>
      {canLeft && (
        <button type="button" onClick={() => scroll(-1)} aria-label="Ver anteriores" className={`${arrow} -left-3`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {canRight && (
        <button type="button" onClick={() => scroll(1)} aria-label="Ver próximos" className={`${arrow}`} style={{ right: `calc(1rem - ${BLEED})` }}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}

      <ul
        ref={ref}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 md:mx-0 md:-mr-[calc(50vw-50%)] md:px-0 md:pr-[calc(50vw-50%)]"
      >
        {lead && <li className="w-[86vw] shrink-0 snap-start sm:w-[340px]">{lead}</li>}
        {books.map((book) => (
          <li key={book.id} data-spread className="w-[72%] shrink-0 snap-start sm:w-[300px]">
            <ProductCard product={book} variant="flat" sizes="(min-width: 640px) 300px, 72vw" />
          </li>
        ))}
      </ul>
    </div>
  )
}
