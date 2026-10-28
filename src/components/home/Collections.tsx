'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { collections, type CollectionTone } from '@/data/collections'
import { gsap, ScrollTrigger, useGSAP, MEDIA } from '@/lib/gsap'
import SectionHeading from './SectionHeading'

const TONES: Record<CollectionTone, string> = {
  marrom: 'bg-marrom-medio text-creme',
  tan: 'bg-tan text-espresso-deep',
  creme: 'bg-creme-card text-espresso ring-1 ring-espresso/20',
  vinho: 'bg-vinho text-creme',
}

const ICONS: Record<string, string> = {
  book: 'M4 5.5A1.5 1.5 0 015.5 4H19v16H5.5A1.5 1.5 0 014 18.5v-13zM19 17H5.5A1.5 1.5 0 004 18.5',
  notebook: 'M6 3h12a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM9 3v18M12 8h4M12 12h4',
  pen: 'M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3',
  mug: 'M5 8h11v7a4 4 0 01-4 4H9a4 4 0 01-4-4V8zM16 10h2a2 2 0 010 4h-2M8 3v2M12 3v2',
  gift: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-3-5-3-5-1s3 1 5 1zM12 7c2-3 5-3 5-1s-3 1-5 1z',
  bookmark: 'M7 3h10v18l-5-4-5 4V3z',
  tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01',
}

/**
 * Coleções em círculos. Entram com um pop elástico em cascata; no desktop cada círculo é "magnético"
 * (acompanha o mouse de leve). Sem animação, tudo aparece no lugar.
 */
export default function Collections() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      const build = (magnetic: boolean) => () => {
        const circles = gsap.utils.toArray<HTMLElement>('[data-circle]', el)
        const labels = gsap.utils.toArray<HTMLElement>('[data-label]', el)
        gsap.set(circles, { scale: 0, autoAlpha: 0 })
        gsap.set(labels, { y: 12, autoAlpha: 0 })

        ScrollTrigger.create({
          trigger: el,
          start: 'top 78%',
          once: true,
          onEnter: () => {
            gsap.to(circles, { scale: 1, autoAlpha: 1, duration: 1.1, ease: 'elastic.out(1, 0.55)', stagger: 0.09 })
            gsap.to(labels, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out', stagger: 0.09, delay: 0.25 })
          },
        })

        const offs: Array<() => void> = []
        if (magnetic && window.matchMedia('(hover: hover)').matches) {
          gsap.utils.toArray<HTMLElement>('[data-magnet]', el).forEach((item) => {
            const circle = item.querySelector<HTMLElement>('[data-inner]')
            if (!circle) return
            const xTo = gsap.quickTo(circle, 'x', { duration: 0.5, ease: 'power3' })
            const yTo = gsap.quickTo(circle, 'y', { duration: 0.5, ease: 'power3' })
            const move = (e: PointerEvent) => {
              const r = item.getBoundingClientRect()
              xTo((e.clientX - (r.left + r.width / 2)) * 0.28)
              yTo((e.clientY - (r.top + r.height / 2)) * 0.28)
            }
            const leave = () => {
              xTo(0)
              yTo(0)
            }
            item.addEventListener('pointermove', move)
            item.addEventListener('pointerleave', leave)
            offs.push(() => {
              item.removeEventListener('pointermove', move)
              item.removeEventListener('pointerleave', leave)
            })
          })
        }
        return () => offs.forEach((off) => off())
      }

      mm.add(MEDIA.full, build(true))
      mm.add(MEDIA.light, build(false))
    },
    { scope: root },
  )

  return (
    <section ref={root} data-tone="light" className="overflow-x-clip bg-bg py-14 md:py-20 lg:min-h-[760px] lg:py-24" aria-labelledby="colecoes-titulo">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="relative h-[320px] overflow-hidden rounded-3xl bg-espresso shadow-[0_24px_60px_-28px_rgb(43_27_20/0.45)] sm:h-[420px] lg:h-[560px]">
          <Image
            src="/collections-reader.png"
            alt="Mulher aproveita um momento tranquilo para ler em uma biblioteca acolhedora"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/25 via-transparent to-transparent" aria-hidden="true" />
        </div>
        <div className="min-w-0">
        <SectionHeading eyebrow="Explore" title="Coleções" id="colecoes-titulo" href="/produtos" linkLabel="Ver tudo" />

        <ul className="grid grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-4">
          {collections.map((c) => (
            <li key={c.label} data-magnet>
              <Link href={c.href} className="group flex flex-col items-center gap-3">
                <span data-circle className="block">
                  <span
                    data-inner
                    className={`flex h-[84px] w-[84px] items-center justify-center rounded-full shadow-[0_14px_28px_-14px_rgb(43_27_20/0.55)] transition-transform duration-300 group-hover:scale-105 sm:h-[96px] sm:w-[96px] md:h-[110px] md:w-[110px] ${TONES[c.tone]}`}
                  >
                    <svg className="h-9 w-9 md:h-11 md:w-11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={ICONS[c.icon]} />
                    </svg>
                  </span>
                </span>
                <span data-label className="text-center text-sm font-medium text-ink md:text-base">{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </section>
  )
}
