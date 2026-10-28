'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap, SplitText, useGSAP, MEDIA, scoped } from '@/lib/gsap'
import { onPreloaderDone } from '@/lib/preloader'
import { siteConfig } from '@/site.config'

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m-6-6 6 6-6 6" />
    </svg>
  )
}

/**
 * Hero em camadas separadas:
 *  1. fundo (foto da livraria)  2. luz por cima (foco fixo do abajur + foco que segue o mouse).
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const lamp = useRef<HTMLDivElement>(null)
  const { eyebrow, title, highlight, subtitle, primaryCta, secondaryCta } = siteConfig.hero

  const at = title.indexOf(highlight)
  const before = at >= 0 ? title.slice(0, at).trim() : title
  const after = at >= 0 ? title.slice(at + highlight.length).trim() : ''

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      const build = (full: boolean) => () => {
        const q = gsap.utils.selector(el)
        const chars: Element[] = []

        // Título: letras sobem de dentro de uma máscara.
        const split = SplitText.create(q('[data-split]'), { type: 'words,chars', mask: 'chars' })
        chars.push(...split.chars)
        const items = q('[data-rise]')
        const underline = q('[data-underline] path')

        // Estado inicial (só quando o JS está ativo; sem JS tudo fica visível).
        gsap.set(chars, { yPercent: 115 })
        gsap.set(items, { y: 24, autoAlpha: 0 })
        gsap.set(underline, { drawSVG: '0%' })

        let undo = () => {}
        const cancel = onPreloaderDone(() => {
          undo = scoped(el, () => {
            const tl = gsap.timeline()
            tl.to(items[0] ?? [], { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, 0)
              .to(chars, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: full ? 0.028 : 0.018 }, 0.1)
              .to(underline, { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut' }, '>-0.25')
              .to(items.slice(1), { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, '<0.1')
          })
        })

        // Luz de abajur: segue o mouse (só onde existe hover).
        let off = () => {}
        const light = lamp.current
        if (full && light && window.matchMedia('(hover: hover)').matches) {
          const rect = () => el.getBoundingClientRect()
          gsap.set(light, { x: rect().width * 0.62 - 450, y: rect().height * 0.3 - 450 })
          const xTo = gsap.quickTo(light, 'x', { duration: 0.9, ease: 'power3' })
          const yTo = gsap.quickTo(light, 'y', { duration: 0.9, ease: 'power3' })
          const move = (e: PointerEvent) => {
            const r = rect()
            xTo(e.clientX - r.left - 450)
            yTo(e.clientY - r.top - 450)
          }
          el.addEventListener('pointermove', move)
          off = () => el.removeEventListener('pointermove', move)
        }

        return () => {
          cancel()
          undo()
          off()
          split.revert()
        }
      }

      mm.add(MEDIA.full, build(true))
      mm.add(MEDIA.light, build(false))
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative isolate overflow-hidden" aria-labelledby="home-title" data-hero>
      {/* Camada 1: fundo (foto antiga da livraria) */}
      <Image
        src="/hero-bg-bookstore.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-30 object-cover object-center"
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgb(30_18_13/0.94)_0%,rgb(30_18_13/0.78)_38%,rgb(30_18_13/0.25)_72%,transparent_100%),linear-gradient(0deg,rgb(30_18_13/0.6),transparent_45%)]" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col px-5 pb-[calc(8rem+100px)] pt-[13.5rem] md:px-10 md:min-h-[min(calc(78vh+100px),790px)] md:flex-row md:items-center md:gap-2 md:pb-24 md:pt-32">
        {/* Texto */}
        <div className="relative z-20 md:w-[58%] md:max-w-[800px]">
          <p data-rise className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-tan">{eyebrow}</p>
          <h1 id="home-title" className="text-[clamp(2.7rem,5.4vw,4.9rem)] leading-[1.06] tracking-[0.02em] text-creme">
            <span data-split>{before}</span>{' '}
            <span className="relative inline-block text-tan">
              <span data-split>{highlight}</span>
              <svg data-underline viewBox="0 0 300 14" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full" fill="none" aria-hidden="true">
                <path d="M3 9C60 3 118 13 178 6s100-3 119 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </span>
            {after && <>{' '}<span data-split>{after}</span></>}
          </h1>
          <p data-rise className="mt-6 max-w-[540px] text-base leading-relaxed text-creme/90 md:text-xl">{subtitle}</p>
          <div data-rise className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryCta.href} className="btn-primary !min-h-[54px] !rounded-full !px-8 !text-[15px]">
              {primaryCta.label} <ArrowIcon />
            </Link>
            <Link href={secondaryCta.href} className="btn-outline !min-h-[54px] !rounded-full !border-creme/70 !px-8 !text-[15px] !text-creme hover:!bg-creme/10">
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Camada 2: luz por cima (brilho fixo do abajur + foco que segue o mouse) */}
      <div className="pointer-events-none absolute inset-0 z-[15] mix-blend-soft-light bg-[radial-gradient(ellipse_at_62%_30%,rgb(217_166_107/0.55),transparent_55%)]" aria-hidden="true" />
      <div ref={lamp} className="pointer-events-none absolute left-0 top-0 z-[16] h-[900px] w-[900px] rounded-full mix-blend-soft-light bg-[radial-gradient(circle,rgb(255_226_170/0.7),transparent_62%)]" aria-hidden="true" />
    </section>
  )
}
