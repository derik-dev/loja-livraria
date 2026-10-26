import Image from 'next/image'

// Capas geradas para livros ainda sem foto: só cores do tema.
const BINDINGS = [
  { bg: 'var(--card-hover)', fg: 'var(--ink)', line: 'var(--accent)' },
  { bg: 'var(--accent)', fg: 'var(--on-accent)', line: 'var(--on-accent)' },
  { bg: 'var(--card)', fg: 'var(--ink)', line: 'var(--muted)' },
  { bg: 'var(--ink)', fg: 'var(--bg)', line: 'var(--accent)' },
]

function pick(title: string) {
  let h = 0
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0
  return BINDINGS[h % BINDINGS.length]
}

/** Capa gerada na hora, usada quando o livro ainda não tem foto. */
export function BookCover({ title, className = '' }: { title: string; className?: string }) {
  const c = pick(title)
  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-[11%] py-[10%] text-center ${className}`}
      style={{ background: c.bg, color: c.fg, containerType: 'inline-size' }}
      role="img"
      aria-label={`Capa de ${title}`}
    >
      <div className="pointer-events-none absolute inset-[5%] rounded-sm border" style={{ borderColor: c.line, opacity: 0.6 }} aria-hidden="true" />
      <span className="relative text-[clamp(0.5rem,5cqw,0.9rem)]" style={{ color: c.line }} aria-hidden="true">✦</span>
      <span
        className="bk-display relative text-[clamp(0.8rem,9cqw,1.5rem)] leading-[1.12] [overflow-wrap:anywhere]"
        style={{ fontWeight: 600 }}
      >
        {title}
      </span>
      <span className="relative text-[clamp(0.45rem,4cqw,0.7rem)] uppercase tracking-[0.3em]" style={{ color: c.line }}>
        Papelada
      </span>
    </div>
  )
}

// Hosts liberados em next.config.ts; qualquer outro remoto é servido sem otimização para não quebrar.
function isOptimizable(src: string) {
  if (src.startsWith('/')) return true
  try {
    const host = new URL(src).hostname
    return host === 'images.unsplash.com' || host.endsWith('.supabase.co')
  } catch {
    return false
  }
}

/** Foto do livro (next/image) ou, se não houver, a capa gerada. Preenche o contêiner pai. */
export function BookImage({
  src,
  title,
  className = 'object-cover',
  sizes = '(min-width: 1024px) 240px, 45vw',
  priority = false,
}: {
  src?: string
  title: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  if (!src) return <BookCover title={title} />
  return (
    <span
      className="relative block h-full w-full overflow-hidden"
      style={{ containerType: 'inline-size' }}
      role="img"
      aria-label={`Capa de ${title}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={!isOptimizable(src)}
        className={className}
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-[9%] pb-[11%] pt-[35%] text-left text-on-image">
        <span className="mb-[5%] block text-[clamp(0.4rem,4cqw,0.65rem)] font-semibold uppercase tracking-[0.2em] text-on-image/75">
          Papelada · demonstração
        </span>
        <span className="bk-display block text-[clamp(0.7rem,9cqw,1.35rem)] font-semibold leading-[1.05] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] overflow-hidden">
          {title}
        </span>
      </span>
    </span>
  )
}
