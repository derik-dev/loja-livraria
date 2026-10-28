import type { Metadata } from 'next'
import { PageHero } from '@/components/zine'
import AuthorsBrowser from '@/components/home/AuthorsBrowser'
import { getAuthors } from '@/lib/authors'
import { BRAND_NAME } from '@/lib/brand'

export const metadata: Metadata = {
  title: `Autores | ${BRAND_NAME}`,
  description: 'Todos os autores do catálogo, em ordem alfabética.',
}

export default function AutoresPage() {
  const authors = getAuthors()

  return (
    <div>
      <div data-tone="dark">
        <PageHero title="Autores" note="Quem escreve" image="/banners/catalogo.png" wide />
      </div>

      <div data-tone="light" className="min-h-[60vh] bg-bg px-4 py-10 md:px-12 md:py-14 lg:px-20">
        <AuthorsBrowser authors={authors.map((a) => ({ name: a.name, slug: a.slug, count: a.books.length }))} />
      </div>
    </div>
  )
}
