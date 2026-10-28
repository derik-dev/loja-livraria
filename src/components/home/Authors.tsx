'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { authors } from '@/data/authors'
import { gsap, ScrollTrigger, useGSAP, MEDIA } from '@/lib/gsap'
import SectionHeading from './SectionHeading'

const TONES = {
  marrom: 'bg-marrom-medio text-creme',
  tan: 'bg-tan text-espresso-deep',
  creme: 'bg-creme-card text-espresso ring-1 ring-inset ring-espresso/15',
  vinho: 'bg-vinho text-creme',
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

/**
 * Autores em molduras de ARCO (não círculo). Cada arco é revelado por uma máscara que sobe, e a foto/iniciais
 * dão zoom no hover. Sem foto cadastrada, o arco mostra as iniciais sobre um bloco de cor da paleta.
 */
export default function Authors() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      const build = () => {
        const frames = gsap.utils.toArray<HTMLElement>('[data-arch]', el)
        gsap.set(frames, { clipPath: 'inset(100% 0% 0% 0%)' })
        ScrollTrigger.create({
          trigger: el,
          start: 'top 75%',
          once: true,
          onEnter: () => gsap.to(frames, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.inOut', stagger: 0.12 }),
        })
      }
      mm.add(`${MEDIA.full}, ${MEDIA.light}`, build)
    },
    { scope: root },
  )

  return (
    <section ref={root} data-tone="light" data-surface="alt" className="bg-bg py-14 md:py-20" aria-labelledby="autores-titulo">
      <div className="container-page">
        <SectionHeading eyebrow={authors.eyebrow} title={authors.title} id="autores-titulo" />

        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {authors.items.map((a) => (
            <li key={a.name}>
              <Link href={`/produtos?autor=${encodeURIComponent(a.name)}`} className="group block text-center">
                <div data-arch className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-2xl">
                  {a.photo ? (
                    <Image src={a.photo} alt={a.name} fill sizes="(min-width: 1024px) 220px, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center transition-transform duration-700 group-hover:scale-110 ${TONES[a.tone]}`}>
                      <span className="font-display text-6xl md:text-7xl" aria-hidden="true">{initials(a.name)}</span>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-base font-semibold text-ink md:text-lg">{a.name}</p>
                <p className="mt-0.5 text-sm text-muted">{a.books} {a.books === 1 ? 'livro' : 'livros'} no catálogo</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
