'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { BookImage } from '@/components/zine'
import { gsap, SplitText, ScrollTrigger, useGSAP, MEDIA } from '@/lib/gsap'
import { teamPicks } from '@/data/teamPicks'
import SectionHeading from './SectionHeading'

/**
 * Escolha da equipe: foto grande revelada por clip-path (com parallax) e, ao lado, os livros escolhidos
 * com a frase "digitada" letra a letra.
 */
export default function TeamPicks({ products }: { products: Product[] }) {
  const root = useRef<HTMLElement>(null)
  const picks = teamPicks.picks.flatMap((pick) => {
    const book = products.find((p) => p.slug === pick.slug)
    return book ? [{ ...pick, book }] : []
  })

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      const build = (full: boolean) => () => {
        const frame = el.querySelector('[data-frame]')
        const photo = el.querySelector('[data-photo]')
        const rows = gsap.utils.toArray<HTMLElement>('[data-pick]', el)
        const splits = gsap.utils.toArray<HTMLElement>('[data-quote]', el).map((q) => SplitText.create(q, { type: 'chars' }))

        gsap.set(frame, { clipPath: 'inset(100% 0% 0% 0%)' })
        gsap.set(rows, { y: 30, autoAlpha: 0 })
        splits.forEach((s) => gsap.set(s.chars, { autoAlpha: 0 }))

        ScrollTrigger.create({
          trigger: frame,
          start: 'top 80%',
          once: true,
          onEnter: () => gsap.to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut' }),
        })
        if (full && photo) {
          gsap.fromTo(photo, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } })
        }
        rows.forEach((row, i) => {
          ScrollTrigger.create({
            trigger: row,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.to(row, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' })
              // Digitando: as letras aparecem em sequência rápida.
              gsap.to(splits[i].chars, { autoAlpha: 1, duration: 0.01, stagger: 0.022, delay: 0.35 })
            },
          })
        })
        return () => splits.forEach((s) => s.revert())
      }

      mm.add(MEDIA.full, build(true))
      mm.add(MEDIA.light, build(false))
    },
    { scope: root },
  )

  if (picks.length === 0) return null

  return (
    <section ref={root} data-tone="light" data-surface="alt" className="bg-bg py-14 md:py-20" aria-labelledby="equipe-titulo">
      <div className="container-page">
        <SectionHeading eyebrow={teamPicks.eyebrow} title={teamPicks.title} id="equipe-titulo" />

        <div className="grid gap-8 md:grid-cols-[5fr_7fr] md:gap-12">
          <div data-frame className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-espresso md:aspect-auto md:min-h-[520px]">
            <div data-photo className="absolute -inset-y-[8%] inset-x-0">
              <Image src={teamPicks.photo} alt={teamPicks.photoAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover object-[80%_center]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-deep/80 via-transparent to-transparent" aria-hidden="true" />
            <p className="absolute inset-x-6 bottom-6 font-display text-2xl leading-tight text-creme md:text-3xl">{teamPicks.caption}</p>
          </div>

          <ul className="flex flex-col gap-4">
            {picks.map(({ book, by, role, quote }) => (
              <li key={book.id} data-pick>
                <Link href={`/produto/${book.slug}`} className="surface surface-lift flex h-full gap-5 p-4 md:p-5">
                  <span data-cursor="Ver" className="relative block aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-sm bg-card-hover ring-1 ring-border md:w-28">
                    <BookImage src={book.images[0]} title={book.name} sizes="112px" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <span data-quote className="block text-lg leading-snug text-ink md:text-xl">“{quote}”</span>
                    <span>
                      <span className="block text-sm text-muted">{by}, {role}</span>
                      <span className="mt-1 block truncate text-sm font-semibold text-accent">{book.name} →</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
