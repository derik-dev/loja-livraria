import Link from 'next/link'

const CATEGORIES = [
  { label: 'Ficção', note: 'Mundos extraordinários', href: '/secao/masculino', icon: 'book' },
  { label: 'Clássicos', note: 'Obras atemporais', href: '/secao/inverno', icon: 'columns' },
  { label: 'Desenvolvimento', note: 'Uma vida melhor', href: '/produtos?q=desenvolvimento', icon: 'mind' },
  { label: 'Romance', note: 'Histórias que tocam', href: '/produtos?q=romance', icon: 'heart' },
  { label: 'Ciência & Tecnologia', note: 'Ideias que moldam o futuro', href: '/secao/tecnologia', icon: 'rocket' },
  { label: 'Ofertas', note: 'Livros com desconto', href: '/produtos?oferta=true', icon: 'gift' },
]

function CategoryIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    book: <><path d="M3 6.5c5.2-1.8 9.5-.8 13 2.2v17c-3.5-3-7.8-4-13-2.2zM29 6.5c-5.2-1.8-9.5-.8-13 2.2v17c3.5-3 7.8-4 13-2.2z" /><path d="M16 8.7v17" /></>,
    columns: <><path d="M4 27h24M7 24V10h4v14m5 0V10h4v14m5 0V10h2v14M5 8l11-5 11 5z" /></>,
    mind: <><path d="M16 4a6 6 0 0 0-10 4.5 6 6 0 0 0-1 11.3A6 6 0 0 0 16 24zm0 0a6 6 0 0 1 10 4.5 6 6 0 0 1 1 11.3A6 6 0 0 1 16 24zM16 4v23M9 10l4 3m-7 5 7-1m11-7-4 3m7 2-7 2" /></>,
    heart: <path d="M27.5 7.5a7 7 0 0 0-10 0L16 9l-1.5-1.5a7 7 0 0 0-10 10L16 29l11.5-11.5a7 7 0 0 0 0-10z" />,
    rocket: <><path d="M18 14 9 23l-5 1 1-5 9-9m4 4 5 5M12 7c4-4 9-5 14-5 0 5-1 10-5 14l-6 6-7-7z" /><circle cx="20" cy="8" r="2" /><path d="m8 24-4 4m10-3-1 4m-6-8-4 1" /></>,
    gift: <><path d="M3 13h26v16H3zM1 8h30v5H1zm15 0v21M16 8H9a3 3 0 1 1 3-3c0 2 4 3 4 3zm0 0h7a3 3 0 1 0-3-3c0 2-4 3-4 3z" /></>,
  }

  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-9 w-9 shrink-0">{paths[name]}</svg>
}

/** Atalhos visuais para as principais categorias da livraria. */
export default function CategoryChips() {
  return (
    <nav aria-label="Explore por categoria" className="home-category-band">
      <ul className="mx-auto grid grid-cols-2 gap-3 px-4 py-5 sm:grid-cols-3 md:grid-cols-3 md:gap-4 md:px-10 md:py-7 lg:px-[2.6vw] xl:grid-cols-6">
        {CATEGORIES.map((category) => (
          <li key={category.label}>
            <Link href={category.href} className="home-category-card group flex min-h-[78px] items-center gap-4 rounded-[26px] border border-[#f4c181]/20 px-4 py-3 text-[#fff] transition-colors hover:border-[#f4c181]/70 hover:bg-[#fff]/[0.04] md:min-h-[82px] md:px-5">
              <span className="text-[#ffbd59] transition-transform group-hover:scale-105"><CategoryIcon name={category.icon} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium md:text-[15px]">{category.label}</span>
                <span className="mt-0.5 block truncate text-xs text-[#fff]/65">{category.note}</span>
              </span>
              <span className="text-lg leading-none text-[#fff]/80" aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
