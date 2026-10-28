'use client'

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, useGSAP } from '@/lib/gsap'

/**
 * Cursor customizado: um anel que acompanha o mouse e vira uma bolha com "Ver" sobre qualquer elemento com
 * data-cursor (as capas dos livros). Só existe com mouse de verdade (hover + pointer fino) e sem prefers-reduced-motion.
 * Anima apenas transform e opacity.
 */
export default function CustomCursor() {
  const pathname = usePathname()
  const ring = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const el = ring.current
    if (!el) return
    const mm = gsap.matchMedia()

    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const html = document.documentElement
      html.classList.add('has-custom-cursor')

      const BASE = 0.34
      gsap.set(el, { xPercent: -50, yPercent: -50, x: -200, y: -200, scale: BASE, autoAlpha: 0 })
      gsap.set([fill.current, label.current], { autoAlpha: 0 })
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' })

      let visible = false
      let active = false

      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        if (!visible) {
          visible = true
          gsap.set(el, { x: e.clientX, y: e.clientY })
          gsap.to(el, { autoAlpha: 1, duration: 0.25 })
        }
        xTo(e.clientX)
        yTo(e.clientY)
      }

      const setActive = (on: boolean, text = 'Ver') => {
        if (on === active) return
        active = on
        if (label.current) label.current.textContent = text
        gsap.to(el, { scale: on ? 1 : BASE, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
        gsap.to([fill.current, label.current], { autoAlpha: on ? 1 : 0, duration: 0.25 })
      }

      const over = (e: PointerEvent) => {
        const target = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor]')
        if (target) setActive(true, target.dataset.cursor || 'Ver')
        else setActive(false)
      }
      const leave = (e: MouseEvent) => {
        if (e.relatedTarget) return
        visible = false
        gsap.to(el, { autoAlpha: 0, duration: 0.2 })
      }

      window.addEventListener('pointermove', move, { passive: true })
      document.addEventListener('pointerover', over, { passive: true })
      document.addEventListener('mouseout', leave)

      return () => {
        window.removeEventListener('pointermove', move)
        document.removeEventListener('pointerover', over)
        document.removeEventListener('mouseout', leave)
        html.classList.remove('has-custom-cursor')
      }
    })
  }, [])

  if (pathname.startsWith('/admin')) return null

  return (
    <div
      ref={ring}
      data-custom-cursor
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[400] flex h-[84px] w-[84px] items-center justify-center rounded-full border-2 border-tan opacity-0"
    >
      <span ref={fill} className="absolute inset-0 rounded-full bg-tan" />
      <span ref={label} className="relative text-sm font-semibold uppercase tracking-[0.14em] text-espresso-deep">Ver</span>
    </div>
  )
}
