'use client'

import { useRef } from 'react'
import { testimonials } from '@/data/testimonials'
import { gsap, ScrollTrigger, useGSAP, MEDIA } from '@/lib/gsap'

const STAR = 'M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 00-.36-1.12L2.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.29z'

const TONES = {
  marrom: 'bg-marrom-medio text-creme',
  tan: 'bg-tan text-espresso-deep',
  vinho: 'bg-vinho text-creme',
}

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

function StarRow({ className = '', size = 'h-5 w-5' }: { className?: string; size?: string }) {
  return (
    <span className={`flex ${className}`} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`${size} shrink-0`} viewBox="0 0 20 20" fill="currentColor"><path d={STAR} /></svg>
      ))}
    </span>
  )
}

/**
 * Depoimentos em 4 cartões (círculo de iniciais, texto e assinatura manuscrita), com a nota logo abaixo.
 * Entrada: os cartões sobem em cascata, as estrelas se preenchem da esquerda para a direita e a nota conta de 0.
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
        const head = gsap.utils.toArray<HTMLElement>('[data-head]', el)

        if (rating) rating.textContent = '0.0'
        gsap.set(fill, { clipPath: 'inset(0 100% 0 0)' })
        gsap.set(cards, { y: 40, autoAlpha: 0 })
        gsap.set(head, { y: 20, autoAlpha: 0 })

        ScrollTrigger.create({
          trigger: el,
          start: 'top 72%',
          once: true,
          onEnter: () => {
            const counter = { v: 0 }
            gsap.to(head, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 })
            gsap.to(cards, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12, delay: 0.2 })
            gsap.to(counter, {
              v: testimonials.rating,
              duration: 1.6,
              ease: 'power2.out',
              delay: 0.8,
              onUpdate: () => rating && (rating.textContent = counter.v.toFixed(1).replace('.', ',')),
              onComplete: () => rating && (rating.textContent = testimonials.rating.toFixed(1).replace('.', ',')),
            })
            gsap.to(fill, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power2.inOut', delay: 0.8 })
          },
        })
      }
      mm.add(`${MEDIA.full}, ${MEDIA.light}`, build)
    },
    { scope: root },
  )

  const ratingText = testimonials.rating.toFixed(1).replace('.', ',')

  return (
    <section ref={root} data-tone="light" className="overflow-x-clip bg-bg py-16 md:py-24" aria-labelledby="depoimentos-titulo">
      <div className="container-page">
        <div className="text-center">
          <p data-head className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 5.5A1.5 1.5 0 015.5 4H19v16H5.5A1.5 1.5 0 014 18.5v-13zM19 17H5.5A1.5 1.5 0 004 18.5" />
            </svg>
            {testimonials.eyebrow}
          </p>
          <h2 id="depoimentos-titulo" data-head className="mt-3 text-3xl text-ink md:text-5xl">{testimonials.title}</h2>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.items.map((item) => (
            <li key={item.name} data-card className="flex flex-col rounded-2xl border border-border bg-card p-7">
              <span className={`flex h-[52px] w-[52px] items-center justify-center rounded-full text-base font-semibold ${TONES[item.tone]}`} aria-hidden="true">
                {initials(item.name)}
              </span>
              <p className="mt-6 flex-1 text-base leading-relaxed text-ink">{item.text}</p>
              <div className="mt-10">
                <p className="font-signature text-3xl leading-none text-ink">{item.name}</p>
                <p className="mt-2 text-sm text-muted">{item.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <div data-head className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4" aria-label={`Nota ${ratingText} de 5, ${testimonials.total}`}>
          <span className="font-display text-3xl text-ink" aria-hidden="true"><span data-rating>{ratingText}</span></span>
          <span className="relative text-espresso/20" aria-hidden="true">
            <StarRow />
            <span data-stars-fill className="absolute inset-0 text-accent"><StarRow /></span>
          </span>
          <span className="text-base text-ink" aria-hidden="true">{testimonials.total}</span>
        </div>
      </div>
    </section>
  )
}
