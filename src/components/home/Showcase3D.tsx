import Link from 'next/link'
import type { Product } from '@/lib/types'
import { BookImage } from '@/components/zine'

/**
 * Mostruário de livros girando 360° sozinho (CSS 3D, sem JavaScript e sem setas).
 * O anel gira num sentido e cada capa gira no sentido oposto, então todas ficam sempre viradas para quem olha.
 * A velocidade é a duração de `--spin` (um giro completo); ver `.carousel3d` em themes/biblioteca.css.
 */
export default function Showcase3D({ books }: { books: Product[] }) {
  if (books.length === 0) return null
  const step = 360 / books.length

  return (
    <div
      className="carousel3d relative mx-auto h-[310px] w-full max-w-[640px] [--r:105px] sm:h-[400px] sm:[--r:190px] md:h-[470px] md:[--r:235px]"
      role="group"
      aria-label="Livros em destaque, em rotação automática"
    >
      <div className="carousel3d-ring">
        {books.map((book, i) => (
          <div key={book.id} className="carousel3d-slot" style={{ ['--a' as string]: i * step }}>
            <div className="carousel3d-face" style={{ ['--a' as string]: i * step }}>
              <Link
                href={`/produto/${book.slug}`}
                aria-label={`Ver ${book.name}`}
                className="relative block aspect-[2/3] w-[132px] overflow-hidden rounded-lg bg-card-hover ring-1 ring-border sm:w-[172px] md:w-[210px]"
              >
                <BookImage src={book.images[0]} title={book.name} priority={i < 2} sizes="(min-width: 768px) 260px, 180px" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
