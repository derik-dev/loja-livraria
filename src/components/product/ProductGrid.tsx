import { Product } from '@/lib/types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="z-card relative -rotate-2 bg-[var(--z-yellow)] px-8 py-6">
          <p className="z-display text-3xl">Estante vazia</p>
          <p className="z-hand mt-1 text-2xl">nada por aqui… ainda</p>
        </div>
        <p className="mt-6 text-sm font-medium text-zinc-500">Tente outro filtro ou outra palavra.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
