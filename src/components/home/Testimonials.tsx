'use client'

import { useRef } from 'react'
import { testimonials } from '@/data/testimonials'
import { gsap, ScrollTrigger, useGSAP, MEDIA } from '@/lib/gsap'
import SectionHeading from './SectionHeading'

const STAR = 'M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 00-.36-1.12L2.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.29z'

function StarRow({ className = '', size = 'h-7 w-7' }: { className?: string; size?: string }) {
  return (
    <span className={`flex ${className}`} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`${size} shrink-0`} viewBox="0 0 20 20" fill="currentColor"><path d={STAR} /></svg>
      ))}
    </span>
  )
}

/**
 * Depoimentos: a nota (4.9) conta a partir de 0, as estrelas se preenchem da esquerda para a direita e cada
 * assinatura manuscrita é "escrita" com DrawSVG. Sem animação, tudo já aparece completo.
 */
export default function Testimonials() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      const build = () => {
        const rating = el.querySelector<HTMLElement>('[data-rating]')
        const fill = el.querySelector('[data-stars-fill]')
        const cards = gsap.utils.toArray<HTMLElement>('[data-card]', el)
        const lines = gsap.utils.toArray<SVGPathElement>('[data-sign] path', el)
        const names = gsap.utils.toArray<HTMLElement>('[data-signname]', el)

        if (rating) rating.textContent = '0.0'
        gsap.set(fill, { clipPath: 'inset(0 100% 0 0)' })
        gsap.set(cards, { y: 40, autoAlpha: 0 })
        gsap.set(lines, { drawSVG: '0%' })
        gsap.set(names, { autoAlpha: 0 })

        ScrollTrigger.create({
          trigger: el,
          start: 'top 70%',
          once: true,
          onEnter: () => {
            const counter = { v: 0 }
            gsap.to(counter, {
              v: testimonials.rating,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: () => rating && (rating.textContent = counter.v.toFixed(1)),
              onComplete: () => rating && (rating.textContent = testimonials.rating.toFixed(1)),
            })
            gsap.to(fill, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power2.inOut' })
            gsap.to(cards, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15, delay: 0.3 })
            lines.forEach((line, i) => {
              gsap.to(line, { drawSVG: '100%', duration: 1.4, ease: 'power1.inOut', delay: 1 + i * 0.25 })
              gsap.to(names[i], { autoAlpha: 1, duration: 0.6, delay: 1.9 + i * 0.25 })
            })
          },
        })
      }
      mm.add(`${MEDIA.full}, ${MEDIA.light}`, build)
    },
    { scope: root },
  )

  return (
    <section ref={root} data-tone="light" className="overflow-x-clip bg-bg py-14 md:py-20" aria-labelledby="depoimentos-titulo">
      <div className="container-page">
        <SectionHeading eyebrow={testimonials.eyebrow} title={testimonials.title} id="depoimentos-titulo" />

        <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-12">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-espresso px-6 py-10 text-center text-creme lg:items-start lg:text-left" data-tone="dark">
            <p className="font-display text-[6rem] leading-none text-tan md:text-[7.5rem]" aria-label={`Nota ${testimonials.rating} de 5`}>
              <span data-rating>{testimonials.rating.toFixed(1)}</span>
            </p>
            <div className="relative mt-3 text-creme/25">
              <StarRow />
              <div data-stars-fill className="absolute inset-0 text-tan">
                <StarRow />
              </div>
            </div>
            <p className="mt-3 text-sm text-creme/85">{testimonials.total}</p>
          </div>

          <ul className="grid gap-4 md:grid-cols-3">
            {testimonials.items.map((item) => (
              <li key={item.name} data-card className="surface flex flex-col p-6">
                <StarRow className="text-accent" size="h-4 w-4" />
                <p className="mt-4 flex-1 text-base leading-relaxed text-ink">“{item.text}”</p>
                <div className="mt-6">
                  <svg data-sign viewBox="0 0 190 50" className="h-10 w-36 text-ink" fill="none" aria-hidden="true">
                    <path d="M6 38C20 8 34 8 30 30S18 44 38 24 60 10 64 26 56 40 80 22 104 18 110 30 130 34 150 20L176 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p data-signname className="font-signature mt-1 text-2xl leading-none text-ink">{item.name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
