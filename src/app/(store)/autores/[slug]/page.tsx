import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/zine'
import { ProductGrid } from '@/components/product'
import { getAuthorBySlug, getAuthors } from '@/lib/authors'
import { BRAND_NAME } from '@/lib/brand'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAuthors().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = getAuthorBySlug(slug)
  if (!author) return { title: `Autor | ${BRAND_NAME}` }
  return {
    title: `${author.name} | ${BRAND_NAME}`,
    description: `Livros de ${author.name} no catálogo da ${BRAND_NAME}.`,
  }
}

export default async function AutorPage({ params }: Props) {
  const { slug } = await params
  const author = getAuthorBySlug(slug)
  if (!author) notFound()

  const count = author.books.length

  return (
    <div>
      <div data-tone="dark">
        <PageHero title={author.name} note={`${count} ${count === 1 ? 'livro' : 'livros'} no catálogo`} image="/banners/catalogo.png" wide />
      </div>

      <div data-tone="light" className="min-h-[60vh] bg-bg px-4 py-10 md:px-12 md:py-14 lg:px-20">
        <p className="mb-8 text-sm text-muted">
          <Link href="/autores" className="hover:text-accent">Autores</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-ink">{author.name}</span>
        </p>
        <ProductGrid products={author.books} />
      </div>
    </div>
  )
}
