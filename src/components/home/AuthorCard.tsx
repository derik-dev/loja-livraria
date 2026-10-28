import Image from 'next/image'
import Link from 'next/link'

export type AuthorTone = 'marrom' | 'tan' | 'creme' | 'vinho'

const TONES: Record<AuthorTone, string> = {
  marrom: 'bg-marrom-medio text-creme',
  tan: 'bg-tan text-espresso-deep',
  creme: 'bg-creme-card text-espresso ring-1 ring-inset ring-espresso/15',
  vinho: 'bg-vinho text-creme',
}

export const AUTHOR_TONES: AuthorTone[] = ['marrom', 'tan', 'vinho', 'creme']

const initials = (name: string) =>
  name
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

/** Autor em moldura de arco (iniciais sobre um bloco de cor, ou a foto quando existir). Usado na home e em /autores. */
export default function AuthorCard({ name, count, href, tone, photo }: { name: string; count: number; href: string; tone: AuthorTone; photo?: string }) {
  return (
    <Link href={href} className="group block text-center">
      <div data-arch className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-2xl">
        {photo ? (
          <Image src={photo} alt={name} fill sizes="(min-width: 1024px) 220px, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center transition-transform duration-700 group-hover:scale-110 ${TONES[tone]}`}>
            <span className="font-display text-6xl md:text-7xl" aria-hidden="true">{initials(name)}</span>
          </div>
        )}
      </div>
      <p className="mt-4 text-base font-semibold text-ink md:text-lg">{name}</p>
      <p className="mt-0.5 text-sm text-muted">{count} {count === 1 ? 'livro' : 'livros'} no catálogo</p>
    </Link>
  )
}
