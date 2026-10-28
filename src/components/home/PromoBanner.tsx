'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { gsap, SplitText, useGSAP, MEDIA, ScrollTrigger } from '@/lib/gsap'
import { siteConfig } from '@/site.config'

/**
 * Banner de oferta em faixa. O selo "-40%" é carimbado (cai grande, bate e a tela treme de leve) e um texto
 * circular gira em volta dele. Sem animação (mobile leve ou reduced-motion) tudo já aparece no lugar.
 */
export default function PromoBanner() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      const build = (full: boolean) => () => {
        const stamp = el.querySelector('[data-stamp]')
        const ring = el.querySelector('[data-ring]')
        const shake = el.querySelector('[data-shake]')
        const split = SplitText.create(el.querySelector('[data-title]') as Element, { type: 'words', mask: 'words' })
        const bits = gsap.utils.toArray<HTMLElement>('[data-bit]', el)

        gsap.set(split.words, { yPercent: 110 })
        gsap.set(bits, { y: 20, autoAlpha: 0 })
        gsap.set(stamp, { scale: 3, rotation: -24, autoAlpha: 0 })

        if (full && ring) gsap.to(ring, { rotation: 360, duration: 26, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })

        ScrollTrigger.create({
          trigger: el,
          start: 'top 70%',
          once: true,
          onEnter: () => {
            const tl = gsap.timeline()
            tl.to(split.words, { yPercent: 0, duration: 0.8, ease: 'power4.out', stagger: 0.08 })
              .to(bits, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1 }, '-=0.5')
              .to(stamp, { scale: 1, rotation: -9, autoAlpha: 1, duration: 0.28, ease: 'power4.in' }, 0.35)
            if (full && shake) {
              tl.fromTo(shake, { x: 0, y: 0 }, { keyframes: [{ x: -7, y: 4 }, { x: 6, y: -4 }, { x: -4, y: 2 }, { x: 2, y: -1 }, { x: 0, y: 0 }], duration: 0.4, ease: 'none' }, '>')
            }
            tl.to(stamp, { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: 'sine.inOut' }, '>')
          },
        })
        return () => split.revert()
      }

      mm.add(MEDIA.full, build(true))
      mm.add(MEDIA.light, build(false))
    },
    { scope: root },
  )

  const { eyebrow, title, text, stamp, ringText, primaryCta, secondaryCta } = siteConfig.promoBanner

  return (
    <section ref={root} data-tone="dark" className="relative overflow-hidden bg-bg-alt" aria-label="Oferta em destaque">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div data-shake className="container-page relative grid items-center gap-8 py-14 md:grid-cols-[auto_1fr] md:gap-14 md:py-16">
        {/* Selo carimbado + texto girando */}
        <div className="relative mx-auto h-[220px] w-[220px] md:h-[270px] md:w-[270px]">
          <svg data-ring viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-tan" aria-hidden="true">
            <defs>
              <path id="promo-circle" d="M100 100m-82 0a82 82 0 1 1 164 0a82 82 0 1 1-164 0" />
            </defs>
            <text fill="currentColor" fontSize="12.5" fontWeight="600" letterSpacing="3.4">
              <textPath href="#promo-circle">{ringText.repeat(2)}</textPath>
            </text>
          </svg>
          <div data-stamp className="absolute inset-[20%] flex items-center justify-center rounded-full border-[3px] border-dashed border-espresso-deep bg-tan text-espresso-deep shadow-[0_18px_40px_-14px_rgb(0_0_0/0.7)]">
            <span className="font-display text-5xl leading-none md:text-6xl">{stamp}</span>
          </div>
        </div>

        <div className="text-center md:text-left">
          <p data-bit className="text-xs font-semibold uppercase tracking-[0.3em] text-tan">{eyebrow}</p>
          <h2 data-title className="mt-3 text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.08] text-creme">{title}</h2>
          <p data-bit className="mx-auto mt-4 max-w-[520px] text-base text-creme/85 md:mx-0 md:text-lg">
            {text}
          </p>
          <div data-bit className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link href={primaryCta.href} className="btn-primary !min-h-[52px] !rounded-full !px-8">{primaryCta.label}</Link>
            <Link href={secondaryCta.href} className="btn-outline !min-h-[52px] !rounded-full !border-creme/60 !px-8 !text-creme hover:!bg-creme/10">{secondaryCta.label}</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
