import Link from 'next/link'
import type { Product } from '@/lib/types'
import { BookImage } from '@/components/zine'
import SectionHeading from './SectionHeading'

// Indicações da equipe. DADOS FICTÍCIOS: edite livremente (slug do livro, quem indicou e a frase).
// Livros que não existirem no catálogo são ignorados.
const TEAM_PICKS = [
  { slug: 'cartas-ao-mar-de-dentro', by: 'Marina', role: 'livreira', quote: 'Para ler devagar, de preferência perto de uma janela.' },
  { slug: 'jardim-das-coisas-perdidas', by: 'Caio', role: 'atendimento', quote: 'O livro que eu mais empresto, e que sempre volta.' },
  { slug: 'arquivo-das-estrelas', by: 'Helena', role: 'curadoria', quote: 'Boa ficção científica para quem acha que não gosta de ficção científica.' },
  { slug: 'vozes-da-rua-do-norte', by: 'Rafa', role: 'estoque', quote: 'Começou numa noite e eu só parei na última página.' },
]

export default function TeamPicks({ products }: { products: Product[] }) {
  const picks = TEAM_PICKS.flatMap((pick) => {
    const book = products.find((p) => p.slug === pick.slug)
    return book ? [{ ...pick, book }] : []
  })

  if (picks.length === 0) return null

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 md:py-16" aria-labelledby="equipe-titulo">
      <SectionHeading eyebrow="Curadoria" title="Escolha da equipe" id="equipe-titulo" />

      <ul className="grid gap-4 sm:grid-cols-2">
        {picks.map(({ book, by, role, quote }) => (
          <li key={book.id}>
            <Link href={`/produto/${book.slug}`} className="surface surface-lift flex h-full gap-5 p-5">
              <div className="relative aspect-[2/3] w-24 shrink-0 self-start overflow-hidden rounded-lg bg-card-hover sm:w-28">
                <BookImage src={book.images[0]} title={book.name} sizes="112px" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-[17px] leading-snug text-ink">&ldquo;{quote}&rdquo;</p>
                <p className="mt-3 text-sm text-muted">{by}, {role}</p>
                <p className="mt-auto pt-4 text-sm font-semibold text-accent">
                  {book.name}<span aria-hidden="true"> →</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
