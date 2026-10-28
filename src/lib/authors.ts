import type { Product } from '@/lib/types'
import { mockProducts } from '@/lib/data/products'

export interface AuthorEntry {
  name: string
  slug: string
  books: Product[]
}

/** "Machado de Assis" -> "machado-de-assis" (sem acento, para usar na URL). */
export function slugifyAuthor(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Todos os autores do catálogo, em ordem alfabética, cada um com seus livros. */
export function getAuthors(): AuthorEntry[] {
  const map = new Map<string, AuthorEntry>()
  for (const book of mockProducts) {
    if (!book.author) continue
    const slug = slugifyAuthor(book.author)
    const entry = map.get(slug) ?? { name: book.author, slug, books: [] }
    entry.books.push(book)
    map.set(slug, entry)
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export function getAuthorBySlug(slug: string) {
  return getAuthors().find((a) => a.slug === slug)
}
