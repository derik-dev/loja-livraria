'use client'

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, useGSAP } from '@/lib/gsap'
import { PRELOADER_SAFETY_MS, markPreloaderDone, markPreloaderStarted, shouldRunPreloader } from '@/lib/preloader'
import { siteConfig } from '@/site.config'

/**
 * Preloader: tela espresso, logo desenhada (DrawSVG), capa de livro que abre em 3D e revela o site.
 * Roda 1x por sessão. Sem JS (ou com prefers-reduced-motion) ele nunca bloqueia o conteúdo.
 */
export default function Preloader() {
  const pathname = usePathname()
  const root = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const el = root.current
    if (!el) return

    // Em dev o React monta o efeito duas vezes: se já está rodando, só refaz a timeline.
    const alreadyRunning = (window as Window & { __preloader?: string }).__preloader === 'running'
    if (!alreadyRunning && !shouldRunPreloader()) {
      el.style.display = 'none'
      markPreloaderDone()
      return
    }

    markPreloaderStarted()
    const html = document.documentElement
    html.style.overflow = 'hidden'

    // Timeout de segurança: se a animação travar ou falhar, o preloader sai e libera o site depois de 6s.
    let safety = 0
    const finish = () => {
      window.clearTimeout(safety)
      html.style.overflow = ''
      el.style.display = 'none'
      markPreloaderDone()
    }
    safety = window.setTimeout(finish, PRELOADER_SAFETY_MS)

    const q = gsap.utils.selector(el)
    gsap.set(q('[data-book]'), { autoAlpha: 0, scale: 0.7, y: 20 })
    gsap.set(q('[data-cover]'), { rotationY: 0 })

    const tl = gsap.timeline({ onComplete: finish })
    try {
      tl.from(q('[data-logo] path'), { drawSVG: '0%', duration: 1.1, ease: 'power2.inOut', stagger: 0.12 })
      .from(q('[data-name] span'), { yPercent: 120, duration: 0.6, ease: 'power3.out', stagger: 0.05 }, '-=0.5')
      .to(q('[data-brand]'), { autoAlpha: 0, y: -30, duration: 0.45, ease: 'power2.in' }, '+=0.35')
      .to(q('[data-book]'), { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.1')
      .to(q('[data-cover]'), { rotationY: -168, duration: 1.1, ease: 'power3.inOut' }, '+=0.15')
      .to(q('[data-book]'), { scale: 5, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, '+=0.1')
      .to(el, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' }, '-=0.3')
    } catch {
      finish()
    }

    // Clique para pular
    const skip = () => tl.progress(1)
    el.addEventListener('click', skip)
    return () => {
      el.removeEventListener('click', skip)
      window.clearTimeout(safety)
      html.style.overflow = ''
    }
  }, [])

  if (pathname.startsWith('/admin')) return null

  const letters = siteConfig.name.toUpperCase().split('')

  return (
    <>
      <noscript>
        <style>{'[data-preloader]{display:none!important}'}</style>
      </noscript>
      <div
        ref={root}
        data-preloader
        data-tone="dark"
        role="presentation"
        className="fixed inset-0 z-[300] flex cursor-pointer items-center justify-center bg-espresso-deep"
        style={{ perspective: 1400 }}
      >
        <div data-brand className="flex flex-col items-center gap-5">
          <svg data-logo viewBox="0 0 64 48" className="h-20 w-28 text-tan" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M32 13C22 3 10 7 4 16c9-4 18 0 28 9 10-9 19-13 28-9C54 7 42 3 32 13Z" />
            <path d="M5 23c10-3 18 2 27 9 9-7 17-12 27-9" />
            <path d="M8 30c9-2 16 3 24 9 8-6 15-11 24-9" />
            <path d="M32 10v30" />
            <path d="M32 13C29 7 29 4 32 2c3 2 3 5 0 11Z" />
          </svg>
          <p data-name className="flex overflow-hidden font-[family-name:var(--font-display)] text-3xl tracking-[0.3em] text-creme" aria-label={siteConfig.name}>
            {letters.map((letter, i) => (
              <span key={i} className="inline-block" aria-hidden="true">{letter}</span>
            ))}
          </p>
        </div>

        {/* Livro que abre em 3D */}
        <div data-book className="absolute" style={{ transformStyle: 'preserve-3d' }}>
          <div className="relative h-[300px] w-[210px]" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 rounded-r-md bg-creme-card shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)]">
              <div className="space-y-2 px-8 pt-10" aria-hidden="true">
                {[88, 100, 94, 100, 72, 96, 100, 60].map((w, i) => (
                  <div key={i} className="h-1 rounded-full bg-espresso/15" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            <div data-cover className="absolute inset-0 origin-left" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-r-md border border-tan/40 bg-marrom-medio" style={{ backfaceVisibility: 'hidden' }}>
                <div className="absolute inset-3 rounded-sm border border-tan/50" aria-hidden="true" />
                <p className="font-[family-name:var(--font-display)] text-2xl tracking-[0.18em] text-tan">{siteConfig.name.toUpperCase()}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.5em] text-creme/70">{siteConfig.logo.subtitle}</p>
              </div>
              <div className="absolute inset-0 rounded-l-md bg-creme" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
