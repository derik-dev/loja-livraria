import Image from 'next/image'

// Capas geradas para livros ainda sem foto: cada uma é um bloco sólido da paleta (marrom, tan, creme, vinho)
// com um detalhe gráfico simples. Texto sempre com contraste (claro no escuro, escuro no claro).
const COVERS = [
  { bg: 'var(--color-marrom-medio)', fg: 'var(--color-creme)', accent: 'var(--color-tan)', art: 'sun' },
  { bg: 'var(--color-tan)', fg: 'var(--color-espresso-deep)', accent: 'var(--color-espresso)', art: 'bars' },
  { bg: 'var(--color-creme-card)', fg: 'var(--color-espresso)', accent: 'var(--color-marrom-medio)', art: 'arch' },
  { bg: 'var(--color-vinho)', fg: 'var(--color-creme)', accent: 'var(--color-tan)', art: 'diamond' },
] as const

function pick(title: string) {
  let h = 0
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0
  return COVERS[h % COVERS.length]
}

function Art({ kind, color }: { kind: (typeof COVERS)[number]['art']; color: string }) {
  const common = { viewBox: '0 0 100 100', className: 'h-full w-full', 'aria-hidden': true as const }
  if (kind === 'sun')
    return (
      <svg {...common}>
        <circle cx="50" cy="52" r="30" fill={color} />
        <circle cx="50" cy="52" r="42" fill="none" stroke={color} strokeWidth="1.6" />
      </svg>
    )
  if (kind === 'bars')
    return (
      <svg {...common}>
        <rect x="14" y="22" width="72" height="14" rx="7" fill={color} />
        <rect x="14" y="43" width="50" height="14" rx="7" fill={color} />
        <rect x="14" y="64" width="62" height="14" rx="7" fill={color} />
      </svg>
    )
  if (kind === 'arch')
    return (
      <svg {...common}>
        <path d="M22 96V52a28 28 0 0 1 56 0v44Z" fill={color} />
        <circle cx="50" cy="40" r="7" fill="var(--color-tan)" />
      </svg>
    )
  return (
    <svg {...common}>
      <rect x="27" y="27" width="46" height="46" fill={color} transform="rotate(45 50 50)" />
      <rect x="39" y="39" width="22" height="22" fill="var(--color-vinho)" transform="rotate(45 50 50)" />
    </svg>
  )
}

/** Capa gerada na hora, usada quando o livro ainda não tem foto. */
export function BookCover({ title, className = '' }: { title: string; className?: string }) {
  const c = pick(title)
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden px-[10%] pb-[9%] pt-[15%] ${className}`}
      style={{ background: c.bg, color: c.fg, containerType: 'inline-size' }}
      role="img"
      aria-label={`Capa de ${title}`}
    >
      <span className="text-[clamp(0.42rem,3.6cqw,0.65rem)] font-semibold uppercase tracking-[0.34em]" style={{ color: c.accent }}>
        Papelada
      </span>
      <div className="mx-auto my-[4%] min-h-0 w-[72%] flex-1">
        <Art kind={c.art} color={c.accent} />
      </div>
      <span className="text-[clamp(0.8rem,9.5cqw,1.5rem)] font-semibold leading-[1.1] [overflow-wrap:anywhere]">
        {title}
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
    </span>
  )
}
