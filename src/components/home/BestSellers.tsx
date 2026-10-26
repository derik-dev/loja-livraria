import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { BookImage } from '@/components/zine'
import SectionHeading from './SectionHeading'

/** Ranking numerado de 1 a 5: destaques primeiro; se faltar, completa pela nota. */
export default function BestSellers({ products }: { products: Product[] }) {
  const ranked = [...products]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating)
    .slice(0, 5)

  if (ranked.length === 0) return null

  return (
    <section id="mais-procurados" className="mx-auto max-w-[1200px] scroll-mt-6 px-4 py-12 md:py-16" aria-labelledby="procurados-titulo">
      <SectionHeading eyebrow="Ranking da semana" title="Mais procurados" id="procurados-titulo" href="/produtos" linkLabel="Ver catálogo" />

      <ol className="grid gap-3 lg:grid-cols-2 lg:gap-x-6">
        {ranked.map((p, i) => {
          const discount = p.originalPrice ? calculateDiscount(p.originalPrice, p.price) : null
          return (
            <li key={p.id}>
              <Link href={`/produto/${p.slug}`} className="surface surface-lift flex items-center gap-4 p-4">
                <span className="w-12 shrink-0 text-center text-6xl font-bold leading-none text-accent/25 md:w-16 md:text-7xl" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="sr-only">{i + 1}º lugar:</span>
                <div className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-md bg-card-hover">
                  <BookImage src={p.images[0]} title={p.name} sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[15px] font-medium leading-snug text-ink">{p.name}</p>
                  {p.author && <p className="mt-0.5 truncate text-[13px] text-muted">{p.author}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold text-ink">{formatCurrency(p.price)}</p>
                  {discount && <span className="mt-1 inline-block rounded bg-accent px-1.5 py-0.5 text-[11px] font-bold leading-none text-on-accent">-{discount}%</span>}
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
