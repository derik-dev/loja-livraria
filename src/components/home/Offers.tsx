import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { BookImage } from '@/components/zine'
import ProductCard from '@/components/product/ProductCard'
import SectionHeading from './SectionHeading'

/** Ofertas e destaques: card "Oferta do dia" seguido dos livros em promoção, num carrossel com setas. */
export default function Offers({ products }: { products: Product[] }) {
  const onSale = products
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .sort((a, b) => calculateDiscount(b.originalPrice!, b.price) - calculateDiscount(a.originalPrice!, a.price))
  const [featured, ...rest] = onSale
  if (!featured) return null

  const discount = calculateDiscount(featured.originalPrice!, featured.price)

  const featuredCard = (
    <article data-tone="dark" className="surface relative flex h-full flex-col overflow-hidden p-6">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden="true" />
      <div className="relative flex items-center justify-between">
        <span className="rounded-full bg-tan px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-espresso-deep">Oferta do dia</span>
        <span className="text-base font-semibold text-tan">-{discount}%</span>
      </div>
      <Link href={`/produto/${featured.slug}`} data-cursor="Ver" aria-label={`Ver ${featured.name}`} className="relative mt-6 block self-center">
        <div className="relative aspect-[2/3] w-[200px] overflow-hidden rounded-sm bg-card-hover shadow-[0_18px_40px_-12px_rgb(0_0_0/0.6)] ring-1 ring-border-strong">
          <BookImage src={featured.images[0]} title={featured.name} sizes="200px" />
        </div>
      </Link>
      <div className="relative mt-6 flex flex-1 flex-col">
        <h3 className="text-xl font-semibold leading-snug text-ink">{featured.name}</h3>
        {featured.author && <p className="mt-1 text-sm text-muted">{featured.author}</p>}
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-3xl font-semibold text-tan">{formatCurrency(featured.price)}</span>
            <span className="text-sm text-muted line-through">{formatCurrency(featured.originalPrice!)}</span>
          </div>
          <p className="mt-1 text-sm text-muted">Você economiza {formatCurrency(featured.originalPrice! - featured.price)}</p>
          <Link href={`/produto/${featured.slug}`} className="btn-primary mt-4 w-full">Ver livro</Link>
        </div>
      </div>
    </article>
  )

  return (
    <section data-tone="light" className="relative overflow-x-clip bg-bg py-14 md:py-16" aria-labelledby="ofertas-titulo">
      {/* Só esta seção usa a largura total, com margem de 64px: título e cards começam mais à esquerda que o resto do site. */}
      <div className="container-page">
        <SectionHeading eyebrow="Preço especial" title="Ofertas e destaques" id="ofertas-titulo" href="/produtos" linkLabel="Ver todas" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCard}
          {rest.slice(0, 3).map((book) => (
            <ProductCard key={book.id} product={book} variant="flat" sizes="(min-width: 1024px) 285px, 45vw" />
          ))}
        </div>
      </div>
    </section>
  )
}
