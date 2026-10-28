'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { Flip } from 'gsap/Flip'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'

// Registro único dos plugins: importe `gsap`, `ScrollTrigger`, etc. daqui, nunca de 'gsap' direto.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip, MotionPathPlugin)
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip, MotionPathPlugin, useGSAP }

/** Consultas usadas com gsap.matchMedia(): versão completa, leve (mobile) e sem animação pesada. */
export const MEDIA = {
  full: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
  light: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
}

/**
 * Cria animações dentro de um contexto próprio e devolve a função que as desfaz.
 * Use para animações criadas de forma assíncrona (depois do preloader, num gatilho de scroll) dentro de um
 * gsap.matchMedia(): chamar o contextSafe do useGSAP ali dentro cria um ciclo de contextos e estoura a pilha.
 */
export function scoped(scope: Element | null, fn: () => void) {
  const ctx = gsap.context(fn, scope ?? undefined)
  return () => ctx.revert()
}
