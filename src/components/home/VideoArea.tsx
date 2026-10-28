'use client'

import { useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { gsap, ScrollTrigger, SplitText, useGSAP, MEDIA } from '@/lib/gsap'
import { siteConfig } from '@/site.config'

const QUERY = '(prefers-reduced-motion: reduce)'
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

const fmt = (value: number, decimals = 0) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

/**
 * Texto da experiência da livraria à esquerda (com números que contam) e o vídeo à direita, com moldura tan
 * deslocada e um selo girando. Tudo vem de site.config.ts → videoArea. O vídeo toca sozinho, mudo e em repetição.
 * Entrada: o vídeo é revelado por máscara, o título sobe palavra a palavra e os números contam de 0.
 */
export default function VideoArea() {
  const { src, poster, eyebrow, title, text, cta, badge, stats } = siteConfig.videoArea
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false)
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      const build = (full: boolean) => () => {
        const frame = el.querySelector('[data-video-frame]')
        const outline = el.querySelector('[data-outline]')
        const ring = el.querySelector('[data-ring]')
        const bits = gsap.utils.toArray<HTMLElement>('[data-bit]', el)
        const nums = gsap.utils.toArray<HTMLElement>('[data-num]', el)
        const split = SplitText.create(el.querySelector('[data-title]') as Element, { type: 'words', mask: 'words' })

        gsap.set(frame, { clipPath: 'inset(0% 0% 0% 100%)' })
        gsap.set(outline, { autoAlpha: 0, x: 24, y: 24 })
        gsap.set(split.words, { yPercent: 110 })
        gsap.set(bits, { y: 24, autoAlpha: 0 })
        nums.forEach((n) => (n.textContent = `${n.dataset.prefix ?? ''}0`))
        if (full && ring) gsap.to(ring, { rotation: 360, duration: 24, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })

        ScrollTrigger.create({
          trigger: el,
          start: 'top 70%',
          once: true,
          onEnter: () => {
            const tl = gsap.timeline()
            tl.to(split.words, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.07 })
              .to(bits, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, 0.35)
              .to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut' }, 0.2)
              .to(outline, { autoAlpha: 1, x: 0, y: 0, duration: 0.9, ease: 'power3.out' }, 0.8)
            nums.forEach((n) => {
              const target = Number(n.dataset.value)
              const decimals = Number(n.dataset.decimals ?? 0)
              const counter = { v: 0 }
              gsap.to(counter, {
                v: target,
                duration: 1.8,
                ease: 'power2.out',
                delay: 0.9,
                onUpdate: () => (n.textContent = `${n.dataset.prefix ?? ''}${fmt(counter.v, decimals)}`),
                onComplete: () => (n.textContent = `${n.dataset.prefix ?? ''}${fmt(target, decimals)}`),
              })
            })
          },
        })
        return () => split.revert()
      }

      mm.add(MEDIA.full, build(true))
      mm.add(MEDIA.light, build(false))
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      data-tone="light"
      data-surface="alt"
      className="overflow-x-clip bg-bg px-5 py-16 md:px-16 md:py-28"
      aria-labelledby="experiencia-titulo"
    >
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
        <div>
          <p data-bit className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          <h2 id="experiencia-titulo" data-title className="mt-3 text-4xl leading-[1.08] text-ink md:text-6xl">{title}</h2>
          <p data-bit className="mt-6 text-lg leading-relaxed text-muted md:text-xl">{text}</p>

          <dl data-bit className="mt-9 grid grid-cols-3 gap-4 border-y border-border py-6">
            {stats.map((s) => {
              const prefix = 'prefix' in s ? s.prefix : ''
              const decimals = 'decimals' in s ? s.decimals : 0
              return (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span
                      data-num
                      data-value={s.value}
                      data-prefix={prefix}
                      data-decimals={decimals}
                      className="font-display block text-3xl text-ink md:text-5xl"
                    >
                      {prefix}{fmt(s.value, decimals)}
                    </span>
                    <span className="mt-1 block text-sm text-muted md:text-base" aria-hidden="true">{s.label}</span>
                  </dd>
                </div>
              )
            })}
          </dl>

          <Link data-bit href={cta.href} className="btn-primary mt-9 !min-h-[56px] !rounded-full !px-10 !text-base">{cta.label}</Link>
        </div>

        <div className="relative">
          {/* moldura tan deslocada atrás do vídeo */}
          <div data-outline className="absolute -bottom-4 -left-4 h-full w-full rounded-3xl border-2 border-tan md:-bottom-6 md:-left-6" aria-hidden="true" />

          <div data-video-frame className="relative aspect-video w-full overflow-hidden rounded-3xl bg-espresso-deep shadow-[0_40px_80px_-30px_rgb(0_0_0/0.5)]">
            {src && (
              <video
                key={reduced ? 'manual' : 'auto'}
                className="h-full w-full object-cover"
                src={src}
                poster={poster || undefined}
                autoPlay={!reduced}
                loop
                muted
                playsInline
                controls={reduced}
                preload={reduced ? 'metadata' : 'auto'}
                aria-label={title}
              />
            )}
          </div>

          {/* selo com texto girando */}
          <div className="absolute -top-8 right-3 h-[104px] w-[104px] md:-right-6 md:-top-12 md:h-[148px] md:w-[148px]" aria-hidden="true">
            <svg data-ring viewBox="0 0 200 200" className="h-full w-full text-espresso-deep">
              <defs>
                <path id="video-badge" d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0" />
              </defs>
              <circle cx="100" cy="100" r="98" fill="var(--color-tan)" />
              <text fill="currentColor" fontSize="15" fontWeight="700" letterSpacing="3.6">
                <textPath href="#video-badge">{badge.repeat(2)}</textPath>
              </text>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-espresso-deep">
              <svg className="h-9 w-9 md:h-12 md:w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5.5A1.5 1.5 0 015.5 4H19v16H5.5A1.5 1.5 0 014 18.5v-13zM19 17H5.5A1.5 1.5 0 004 18.5" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
