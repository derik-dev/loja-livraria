import { Product } from '@/lib/types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="surface px-10 py-8">
          <p className="text-2xl font-semibold text-ink">Estante vazia</p>
          <p className="mt-1 text-sm text-muted">Nenhum livro com esses filtros.</p>
        </div>
        <p className="mt-6 text-sm text-muted">Tente outro filtro ou outra palavra.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant="flat" />
      ))}
    </div>
  )
}
