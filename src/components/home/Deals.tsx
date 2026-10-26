import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { BookImage } from '@/components/zine'
import BookCarousel from './BookCarousel'
import SectionHeading from './SectionHeading'

/** Oferta do dia (maior desconto) em destaque + carrossel com as demais ofertas. */
export default function Deals({ products }: { products: Product[] }) {
  const onSale = products
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .sort((a, b) => calculateDiscount(b.originalPrice!, b.price) - calculateDiscount(a.originalPrice!, a.price))

  if (onSale.length === 0) return null

  const [featured, ...rest] = onSale
  const discount = calculateDiscount(featured.originalPrice!, featured.price)

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 md:py-16" aria-labelledby="ofertas-titulo">
      <SectionHeading eyebrow="Preço especial" title="Ofertas" id="ofertas-titulo" href="/produtos" linkLabel="Ver todas" />

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <article className="surface flex flex-col p-6">
          <span className="w-fit rounded bg-accent px-2.5 py-1 text-xs font-bold text-on-accent">Oferta do dia</span>

          <Link href={`/produto/${featured.slug}`} className="mt-5 block self-center" aria-label={`Ver ${featured.name}`}>
            <div className="relative aspect-[2/3] w-[170px] overflow-hidden rounded-lg bg-card-hover">
              <BookImage src={featured.images[0]} title={featured.name} sizes="170px" />
            </div>
          </Link>

          <h3 className="z-plain mt-5 text-xl font-semibold leading-snug text-ink">{featured.name}</h3>
          {featured.author && <p className="mt-1 text-sm text-muted">{featured.author}</p>}

          <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-3xl font-semibold text-ink">{formatCurrency(featured.price)}</span>
            <span className="text-sm text-muted line-through">{formatCurrency(featured.originalPrice!)}</span>
            <span className="rounded bg-accent px-1.5 py-0.5 text-xs font-bold leading-none text-on-accent">-{discount}%</span>
          </div>

          <Link href={`/produto/${featured.slug}`} className="btn-primary mt-5 w-full">Ver livro</Link>
        </article>

        <div className="min-w-0">
          {rest.length > 0 ? (
            <BookCarousel books={rest} label="Mais ofertas" />
          ) : (
            <p className="text-sm text-muted">Só esta oferta por enquanto. Volte logo: o catálogo muda toda semana.</p>
          )}
        </div>
      </div>
    </section>
  )
}
