'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, MEDIA } from '@/lib/gsap'
import { siteConfig } from '@/site.config'
import { BRAND_NAME } from '@/lib/brand'

/**
 * Loja física: dados do endereço e um mapa ESTÁTICO ilustrado nas cores da marca (sem iframe e sem spinner).
 * O mapa é revelado por uma máscara que abre da esquerda para a direita.
 */
export default function VisitStore() {
  const root = useRef<HTMLElement>(null)
  const a = siteConfig.address

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(`${MEDIA.full}, ${MEDIA.light}`, () => {
        const map = el.querySelector('[data-map]')
        gsap.set(map, { clipPath: 'inset(0% 100% 0% 0%)' })
        ScrollTrigger.create({
          trigger: map,
          start: 'top 80%',
          once: true,
          onEnter: () => gsap.to(map, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut' }),
        })
      })
    },
    { scope: root },
  )

  const route = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.mapQuery)}`

  return (
    <section ref={root} id="loja" data-tone="dark" className="scroll-mt-6 overflow-x-clip bg-bg py-14 md:py-20" aria-labelledby="visite-titulo">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Loja física</p>
          <h2 id="visite-titulo" className="mt-2 text-3xl text-ink md:text-4xl">Visite a livraria</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
            A {BRAND_NAME} também tem loja física. Venha folhear os livros com calma, conversar com a gente e levar o que ainda não estava na sua lista.
          </p>
          <dl className="mt-7 space-y-3 text-base">
            <div className="flex gap-3"><dt className="w-24 shrink-0 text-muted">Endereço</dt><dd className="text-ink">{a.street}, {a.district}<br />{a.city} - {a.state}, {a.zip}</dd></div>
            <div className="flex gap-3"><dt className="w-24 shrink-0 text-muted">Horário</dt><dd className="text-ink">{a.hours}</dd></div>
            <div className="flex gap-3"><dt className="w-24 shrink-0 text-muted">Telefone</dt><dd className="text-ink">{a.phone}</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={route} target="_blank" rel="noopener noreferrer" className="btn-primary !rounded-full !px-8">Como chegar</a>
            <a href={`tel:${a.phone.replace(/\D/g, '')}`} className="btn-outline !rounded-full !px-8">Ligar</a>
          </div>
        </div>

        <div data-map className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-espresso-deep" role="img" aria-label={`Mapa ilustrado: ${a.street}, ${a.district}, ${a.city}`}>
          <svg viewBox="0 0 600 450" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="600" height="450" fill="var(--color-espresso-deep)" />
            {/* parque e rio */}
            <rect x="40" y="250" width="150" height="130" rx="22" fill="var(--color-marrom-medio)" opacity="0.28" />
            <path d="M-10 120C110 70 190 190 320 150S520 60 620 110" stroke="var(--color-marrom-medio)" strokeWidth="34" strokeLinecap="round" opacity="0.4" fill="none" />
            {/* quadras */}
            <g fill="var(--color-creme)" opacity="0.07">
              <rect x="230" y="200" width="110" height="70" rx="8" /><rect x="360" y="190" width="90" height="90" rx="8" />
              <rect x="470" y="210" width="90" height="70" rx="8" /><rect x="230" y="300" width="110" height="90" rx="8" />
              <rect x="360" y="310" width="90" height="80" rx="8" /><rect x="470" y="300" width="90" height="90" rx="8" />
              <rect x="60" y="30" width="130" height="60" rx="8" /><rect x="230" y="20" width="100" height="70" rx="8" />
              <rect x="420" y="20" width="140" height="60" rx="8" />
            </g>
            {/* ruas */}
            <g stroke="var(--color-tan)" strokeLinecap="round" opacity="0.5" fill="none">
              <path d="M0 290H600" strokeWidth="9" /><path d="M350 0V450" strokeWidth="9" />
              <path d="M215 0V450" strokeWidth="5" /><path d="M460 0V450" strokeWidth="5" />
              <path d="M0 185H600" strokeWidth="5" /><path d="M0 395H600" strokeWidth="5" />
              <path d="M0 440L215 290" strokeWidth="5" />
            </g>
            {/* ponto da loja */}
            <g transform="translate(350 290)">
              <circle r="30" fill="var(--color-tan)" opacity="0.18" className="map-pulse" />
              <path d="M0 -34C-14 -34 -24 -23 -24 -10c0 17 24 36 24 36s24-19 24-36c0-13-10-24-24-24z" fill="var(--color-tan)" />
              <circle cy="-11" r="8" fill="var(--color-espresso-deep)" />
            </g>
          </svg>
          <p className="absolute bottom-4 left-4 rounded-full bg-espresso-deep/80 px-4 py-1.5 text-sm text-creme backdrop-blur">{a.street}</p>
        </div>
      </div>
    </section>
  )
}
