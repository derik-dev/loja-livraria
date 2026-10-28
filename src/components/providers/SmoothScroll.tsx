'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Scroll suave (Lenis) ligado ao ScrollTrigger: lenis.on('scroll', ScrollTrigger.update) + gsap.ticker.
 * Fica desligado no /admin e quando o usuário pede menos movimento (prefers-reduced-motion).
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const disabled = pathname.startsWith('/admin')

  useEffect(() => {
    if (disabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Âncoras (#duvidas, #loja...) passam pelo Lenis para não brigar com o scroll suave.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href*="#"]') as HTMLAnchorElement | null
      if (!link || link.origin !== window.location.origin || link.pathname !== window.location.pathname) return
      const target = link.hash && document.querySelector(link.hash)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target as HTMLElement, { offset: -16 })
    }
    document.addEventListener('click', onClick)

    // Imagens e fontes mudam a altura da página: recalcula os gatilhos quando terminam de carregar.
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)

    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [disabled])

  return <>{children}</>
}
