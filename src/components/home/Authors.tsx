'use client'

import { useRef } from 'react'
import { authors } from '@/data/authors'
import { getAuthors, slugifyAuthor } from '@/lib/authors'
import { gsap, ScrollTrigger, useGSAP, MEDIA } from '@/lib/gsap'
import AuthorCard from './AuthorCard'
import SectionHeading from './SectionHeading'

/**
 * Autores em molduras de ARCO (não círculo). Cada arco é revelado por uma máscara que sobe, e a foto/iniciais
 * dão zoom no hover. A contagem de livros e o link vêm do catálogo; "Ver todos" leva à página /autores.
 */
export default function Authors() {
  const root = useRef<HTMLElement>(null)
  const catalog = getAuthors()
  const featured = authors.items.flatMap((a) => {
    const entry = catalog.find((c) => c.slug === slugifyAuthor(a.name))
    return entry ? [{ ...a, slug: entry.slug, count: entry.books.length }] : []
  })

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

  if (featured.length === 0) return null

  return (
    <section ref={root} data-tone="light" data-surface="alt" className="bg-bg py-14 md:py-20" aria-labelledby="autores-titulo">
      <div className="container-page">
        <SectionHeading eyebrow={authors.eyebrow} title={authors.title} id="autores-titulo" href="/autores" linkLabel="Ver todos" />

        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {featured.map((a) => (
            <li key={a.slug}>
              <AuthorCard name={a.name} count={a.count} href={`/autores/${a.slug}`} tone={a.tone} photo={a.photo} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
