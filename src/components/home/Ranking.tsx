'use client'

import { useRef } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { BookImage } from '@/components/zine'
import { gsap, ScrollTrigger, useGSAP, MEDIA } from '@/lib/gsap'
import SectionHeading from './SectionHeading'

/**
 * Mais procurados: o nº 1 em destaque (grande, com brilho dourado) e 4 linhas ao lado.
 * Números gigantes contam a partir do 0 e as linhas entram alternando esquerda e direita.
 */
export default function Ranking({ products }: { products: Product[] }) {
  const root = useRef<HTMLElement>(null)
  const ranked = [...products]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 5)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      const build = (full: boolean) => () => {
        const numbers = gsap.utils.toArray<HTMLElement>('[data-count]', el)
        const rows = gsap.utils.toArray<HTMLElement>('[data-row]', el)
        const top = el.querySelector('[data-top]')
        const glow = el.querySelector('[data-glow]')

        numbers.forEach((n) => (n.textContent = '0'))
        gsap.set(top, { y: 50, autoAlpha: 0 })
        gsap.set(rows, { x: (i: number) => (i % 2 ? 70 : -70), autoAlpha: 0 })

        ScrollTrigger.create({
          trigger: el,
          start: 'top 72%',
          once: true,
          onEnter: () => {
            gsap.to(top, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' })
            gsap.to(rows, { x: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.14, delay: 0.2 })
            numbers.forEach((n, i) => {
              const target = Number(n.dataset.count)
              const counter = { v: 0 }
              gsap.to(counter, {
                v: target,
                duration: 0.9 + i * 0.12,
                ease: 'power1.out',
                delay: i === 0 ? 0 : 0.25,
                onUpdate: () => (n.textContent = String(Math.round(counter.v))),
                onComplete: () => (n.textContent = String(target)),
              })
            })
            if (full && glow) gsap.to(glow, { opacity: 0.9, scale: 1.08, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
          },
        })
      }

      mm.add(MEDIA.full, build(true))
      mm.add(MEDIA.light, build(false))
    },
    { scope: root },
  )

  if (ranked.length === 0) return null
  const [first, ...others] = ranked
  const firstDiscount = first.originalPrice ? calculateDiscount(first.originalPrice, first.price) : null

  return (
    <section ref={root} id="mais-procurados" data-tone="dark" className="scroll-mt-6 overflow-x-clip bg-bg py-14 md:py-20" aria-labelledby="procurados-titulo">
      <div className="container-page">
        <SectionHeading eyebrow="Ranking da semana" title="Mais procurados" id="procurados-titulo" href="/produtos" linkLabel="Ver catálogo" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          {/* Nº 1 */}
          <div data-top className="relative flex overflow-hidden rounded-3xl border border-tan/40 bg-card p-6 md:p-8">
            <div data-glow className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(217_166_107/0.55),transparent_65%)] opacity-60" aria-hidden="true" />
            <Link href={`/produto/${first.slug}`} className="relative flex w-full flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
              <span data-cursor="Ver" className="relative block aspect-[2/3] w-[190px] shrink-0 overflow-hidden rounded-sm bg-card-hover shadow-[0_26px_44px_-18px_rgb(0_0_0/0.85)] ring-1 ring-tan/50 sm:w-[250px]">
                <BookImage src={first.images[0]} title={first.name} sizes="250px" />
              </span>
              <span className="min-w-0 flex-1 text-center sm:text-left">
                <span className="font-display block text-[7rem] leading-[0.85] text-tan sm:text-[9rem]" aria-hidden="true">
                  <span data-count="1">1</span>
                </span>
                <span className="sr-only">1º lugar:</span>
                <span className="mt-3 block text-xl font-semibold leading-snug text-ink md:text-2xl">{first.name}</span>
                {first.author && <span className="mt-1 block text-sm text-muted">{first.author}</span>}
                <span className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 sm:justify-start">
                  <span className="text-3xl font-semibold text-tan">{formatCurrency(first.price)}</span>
                  {first.originalPrice && <span className="text-sm text-muted line-through">{formatCurrency(first.originalPrice)}</span>}
                  {firstDiscount && <span className="rounded-full bg-tan px-2.5 py-0.5 text-xs font-bold text-espresso-deep">-{firstDiscount}%</span>}
                </span>
              </span>
            </Link>
          </div>

          {/* 2º ao 5º */}
          <ol className="grid grid-cols-1 gap-3">
            {others.map((p, i) => (
              <li key={p.id} data-row>
                <Link href={`/produto/${p.slug}`} className="surface surface-lift flex h-full items-center gap-4 p-3 md:gap-5 md:p-4">
                  <span className="font-display w-12 shrink-0 text-center text-5xl leading-none text-tan/70 md:w-16 md:text-6xl" aria-hidden="true">
                    <span data-count={i + 2}>{i + 2}</span>
                  </span>
                  <span className="sr-only">{i + 2}º lugar:</span>
                  <span data-cursor="Ver" className="relative block aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-sm bg-card-hover md:w-16">
                    <BookImage src={p.images[0]} title={p.name} sizes="64px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-base font-medium leading-snug text-ink">{p.name}</span>
                    {p.author && <span className="mt-0.5 block truncate text-sm text-muted">{p.author}</span>}
                  </span>
                  <span className="shrink-0 text-right text-lg font-semibold text-tan">{formatCurrency(p.price)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
