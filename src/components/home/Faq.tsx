'use client'

import { useRef, useState } from 'react'
import { faq } from '@/data/faq'
import { gsap, MorphSVGPlugin } from '@/lib/gsap'
import SectionHeading from './SectionHeading'

// Ícone: o "+" vira "x" (MorphSVG) ao abrir.
const PLUS = 'M12 5V19M5 12H19'
const CROSS = 'M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5'

/**
 * FAQ: um item aberto por vez, altura animada e ícone que se transforma (+ vira x).
 * Sem JS o `noscript` abre todas as respostas.
 */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const panels = useRef<Array<HTMLDivElement | null>>([])
  const icons = useRef<Array<SVGPathElement | null>>([])
  const animate = (i: number, show: boolean) => {
    const panel = panels.current[i]
    const icon = icons.current[i]
    const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (panel) gsap.to(panel, { height: show ? 'auto' : 0, duration: instant ? 0 : 0.45, ease: 'power2.inOut', overwrite: true })
    if (icon) gsap.to(icon, { morphSVG: { shape: show ? CROSS : PLUS }, duration: instant ? 0 : 0.45, ease: 'power2.inOut', overwrite: true })
  }

  const toggle = (i: number) => {
    const next = open === i ? null : i
    if (open !== null && open !== next) animate(open, false)
    if (next !== null) animate(next, true)
    setOpen(next)
  }

  // MorphSVGPlugin precisa estar registrado; a referência evita que o bundler o descarte.
  void MorphSVGPlugin

  return (
    <section id="duvidas" data-tone="light" data-surface="alt" className="scroll-mt-6 bg-bg py-14 md:py-20" aria-labelledby="faq-titulo">
      <noscript>
        <style>{'[data-faq-panel]{height:auto!important}'}</style>
      </noscript>
      <div className="container-page">
        <div className="mx-auto max-w-[820px]">
          <SectionHeading eyebrow={faq.eyebrow} title={faq.title} id="faq-titulo" />

          <div className="divide-y divide-border border-y border-border">
            {faq.items.map((item, i) => {
              const panelId = `faq-panel-${i}`
              return (
                <div key={item.q}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      aria-expanded={open === i}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left text-lg font-medium text-ink transition-colors hover:text-accent md:text-xl"
                    >
                      {item.q}
                      <svg className="h-6 w-6 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
                        <path ref={(el) => { icons.current[i] = el }} d={i === 0 ? CROSS : PLUS} />
                      </svg>
                    </button>
                  </h3>
                  {/* altura inicial fixa por item: o GSAP assume a altura depois da montagem */}
                  <div id={panelId} data-faq-panel ref={(el) => { panels.current[i] = el }} className="overflow-hidden" style={{ height: i === 0 ? 'auto' : 0 }}>
                    <p className="pb-6 pr-10 text-base leading-relaxed text-muted md:text-lg">{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
