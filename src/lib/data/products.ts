import type { Product } from '@/lib/types'
import { books } from '@/data/books'

/** Catálogo de demonstração; os dados ficam em src/data/books.ts (trocáveis por Supabase). */
export const mockProducts: Product[] = books

export function getMockProductBySlug(slug: string) {
  return mockProducts.find((product) => product.slug === slug)
}

export function getMockCategoryLabel(slug: string) {
  return mockCategories.find((category) => category.slug === slug)?.name ?? slug
}

export function searchMockProducts(query: string, limit = 6) {
  const terms = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .filter(Boolean)

  if (terms.length === 0) return []

  return mockProducts
    .map((product) => {
      const title = product.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
      const searchable = [product.name, product.author ?? '', product.description, product.category, ...product.tags]
        .join(' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
      const matched = terms.filter((term) => searchable.includes(term)).length
      return { product, score: matched + (title.includes(terms.join(' ')) ? 2 : 0) }
    })
    .filter((result) => result.score >= Math.max(1, Math.ceil(terms.length / 2)))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product)
}

export const mockCategories = [
  { slug: 'ficcao', name: 'Ficção' },
  { slug: 'realismo-magico', name: 'Realismo mágico' },
  { slug: 'ficcao-cientifica', name: 'Ficção científica' },
  { slug: 'romance', name: 'Romance' },
  { slug: 'suspense', name: 'Suspense e mistério' },
  { slug: 'infantil', name: 'Infantil' },
  { slug: 'nao-ficcao', name: 'Não ficção' },
  { slug: 'culinaria', name: 'Culinária' },
]
