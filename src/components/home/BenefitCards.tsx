'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, MEDIA, scoped } from '@/lib/gsap'
import { onPreloaderDone } from '@/lib/preloader'
import { siteConfig } from '@/site.config'

const ICONS = [
  // frete
  <path key="a" strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a1.8 1.8 0 100-3.6A1.8 1.8 0 007 19zm10 0a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z" />,
  // pix
  <path key="b" strokeLinecap="round" strokeLinejoin="round" d="M12 3l4.5 4.5L12 12 7.5 7.5 12 3zm0 9l4.5 4.5L12 21l-4.5-4.5L12 12zM3 12l4.5-4.5M21 12l-4.5-4.5M3 12l4.5 4.5M21 12l-4.5 4.5" />,
  // troca
  <path key="c" strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 0113.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 01-13.7 5.6L4 15M4 20v-5h5" />,
  // embalagem
  <path key="d" strokeLinecap="round" strokeLinejoin="round" d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 7.7L12 12.5l8.7-4.8M12 12.5V21" />,
]

/**
 * Quatro cards marrons translúcidos que invadem a base do hero: sobem em cascata,
 * flutuam em profundidade e se movem em velocidades diferentes com o scroll.
 */
export default function BenefitCards() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      const build = (full: boolean) => () => {
        const slots = gsap.utils.toArray<HTMLElement>('[data-slot]', el)
        const cards = gsap.utils.toArray<HTMLElement>('[data-card]', el)

        gsap.set(slots, { y: 90, autoAlpha: 0 })

        let undo = () => {}
        const cancel = onPreloaderDone(() => {
          undo = scoped(el, () => {
            ScrollTrigger.create({
              trigger: el,
              start: 'top 95%',
              once: true,
              onEnter: () => {
                gsap.to(slots, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12 })
                if (!full) return
                // Profundidade: cada card flutua num ritmo próprio e rola numa velocidade diferente.
                cards.forEach((card, i) => {
                  gsap.to(card, { y: -4, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.4 })
                })
                slots.forEach((slot, i) => {
                  gsap.to(slot, {
                    yPercent: [-3, -7, -4, -9][i] ?? -5,
                    ease: 'none',
                    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
                  })
                })
              },
            })
          })
        })
        return () => {
          cancel()
          undo()
        }
      }

      mm.add(MEDIA.full, build(true))
      mm.add(MEDIA.light, build(false))
    },
    { scope: root },
  )

  return (
    <section ref={root} data-tone="dark" className="relative z-20 -mt-24 !bg-transparent md:-mt-20" aria-label="Vantagens da loja">
      {/* a metade de baixo dos cards apoia no creme da próxima seção */}
      <div className="absolute inset-x-0 bottom-0 top-24 -z-10 bg-creme md:top-20" aria-hidden="true" />
      <ul className="container-page grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {siteConfig.benefits.map((benefit, i) => (
          <li key={benefit.title} data-slot>
            <div data-card className="h-full rounded-2xl border border-creme/15 bg-[color-mix(in_srgb,var(--color-marrom-medio)_82%,var(--color-espresso))] p-4 shadow-[0_24px_40px_-20px_rgb(30_18_13/0.7)] backdrop-blur-md md:p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tan/15 text-tan md:h-12 md:w-12">
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">{ICONS[i % ICONS.length]}</svg>
              </span>
              <h3 className="mt-3 text-[17px] font-semibold leading-snug text-creme md:mt-4 md:text-[22px]">{benefit.title}</h3>
              <p className="mt-1.5 text-sm leading-snug text-creme/85 md:text-base">{benefit.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
