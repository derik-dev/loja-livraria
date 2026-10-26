import Link from 'next/link'
import { SECTIONS } from '@/lib/nav'

/** Categorias do catálogo em cartões brancos sobre o fundo marfim. */
export default function GenreTiles() {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="z-plain mb-6 text-2xl font-semibold">Navegue por categoria</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {SECTIONS.map((s) => (
            <li key={s.slug}>
              <Link href={`/secao/${s.slug}`} className="bk-card bk-card-hover group flex h-full items-center justify-between gap-4 p-5 sm:p-6">
                <span>
                  <span className="bk-display block text-xl text-[var(--bk-navy)] sm:text-2xl" style={{ fontWeight: 700 }}>{s.label}</span>
                  <span className="mt-1 block text-[13px] text-[var(--bk-ink-soft)]">{s.note}</span>
                </span>
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bk-gold-pale)] text-[var(--bk-navy)] transition-transform group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
