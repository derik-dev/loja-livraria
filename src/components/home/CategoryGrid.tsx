import Link from 'next/link'
import { SECTIONS } from '@/lib/nav'
import SectionHeading from './SectionHeading'

/** Navegue por categoria: cartões com seta, sem moldura. */
export default function CategoryGrid() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 md:py-16" aria-labelledby="categorias-titulo">
      <SectionHeading eyebrow="Explore" title="Navegue por categoria" id="categorias-titulo" />

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {SECTIONS.map((s) => (
          <li key={s.slug}>
            <Link href={`/secao/${s.slug}`} className="surface surface-lift group flex h-full items-center justify-between gap-3 p-5 md:p-6">
              <span className="min-w-0">
                <span className="z-plain block text-lg font-semibold text-ink md:text-xl">{s.label}</span>
                <span className="mt-1 block text-[13px] text-muted">{s.note}</span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong text-ink transition-colors group-hover:border-accent group-hover:text-accent" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
