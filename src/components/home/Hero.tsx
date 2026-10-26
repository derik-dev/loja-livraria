import Link from 'next/link'
import type { Product } from '@/lib/types'
import Showcase3D from './Showcase3D'

// Texto de prova social. É um PLACEHOLDER: troque pelo número real de pedidos entregues antes de publicar.
const PROOF_DELIVERED = '+2.000 livros entregues'

/** Nota média ponderada pelo número de avaliações; null se ninguém avaliou ainda. */
function averageRating(products: Product[]) {
  const reviews = products.reduce((n, p) => n + p.reviewCount, 0)
  if (reviews === 0) return null
  const total = products.reduce((sum, p) => sum + p.rating * p.reviewCount, 0)
  return (total / reviews).toFixed(1).replace('.', ',')
}

// Quantos livros giram no mostruário do hero
const SHOWCASE_SIZE = 5

export default function Hero({ products }: { products: Product[] }) {
  const covers = [...products]
    .filter((p) => p.images[0])
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, SHOWCASE_SIZE)
  const rating = averageRating(products)

  return (
    <div className="hero-glow">
      <section className="mx-auto max-w-[1200px] px-4 pb-6 pt-10 md:pb-10 md:pt-16">
      <div className="grid items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-12">
        <div className="rise">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Livraria Papelada</p>
          <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.4rem)] text-ink">
            Histórias que merecem uma tarde inteira.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            Ficção, não ficção e clássicos escolhidos a dedo, com preço claro, estoque à vista e entrega para todo o Brasil.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/produtos" className="btn-primary !px-7">Explorar o catálogo</Link>
            <Link href="/secao/novidades" className="btn-outline !px-7">Ver lançamentos</Link>
          </div>

          <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
            {rating && (
              <li className="flex items-center gap-2">
                <span className="text-accent" aria-hidden="true">★★★★★</span>
                <span><strong className="font-semibold text-ink">{rating}</strong> nota média dos leitores</span>
              </li>
            )}
            <li>{PROOF_DELIVERED}</li>
          </ul>
        </div>

        <Showcase3D books={covers} />
      </div>
      </section>
    </div>
  )
}
