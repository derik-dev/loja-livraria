import Link from 'next/link'

// Slugs de seção iguais aos que o admin grava em products.section (só os rótulos são de livro).
const CHIPS = [
  { label: 'Lançamentos', href: '/secao/novidades' },
  { label: 'Ficção', href: '/secao/masculino' },
  { label: 'Não-ficção', href: '/secao/feminino' },
  { label: 'Clássicos', href: '/secao/inverno' },
  { label: 'Mais procurados', href: '#mais-procurados' },
  { label: 'Presentes', href: '/produtos' },
]

/** Uma linha rolável de atalhos por categoria. */
export default function CategoryChips() {
  return (
    <nav aria-label="Atalhos por categoria" className="mx-auto max-w-[1200px] px-4 py-6">
      <ul className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 md:mx-0 md:px-0">
        {CHIPS.map((c) => (
          <li key={c.label} className="snap-start">
            <Link href={c.href} className="chip">{c.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
