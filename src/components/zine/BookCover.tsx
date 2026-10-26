// Encadernações em tecido: verde-garrafa, bordô, azul-marinho, ocre e castanho.
const BINDINGS = [
  { bg: '#1e3d2f', fg: '#e8d9a8', accent: '#d9bf7a' },
  { bg: '#6e1f2c', fg: '#f3e6c4', accent: '#d9bf7a' },
  { bg: '#24405f', fg: '#efe3c0', accent: '#d9bf7a' },
  { bg: '#8a6a2c', fg: '#f6ecd0', accent: '#f0dc9c' },
  { bg: '#3b2a22', fg: '#e9d9b0', accent: '#c9a45c' },
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
      {/* moldura dourada */}
      <div className="pointer-events-none absolute inset-[5%] border" style={{ borderColor: c.accent }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-[6.5%] border" style={{ borderColor: c.accent, opacity: 0.45 }} aria-hidden="true" />
      <span className="relative text-[clamp(0.5rem,5cqw,0.9rem)]" style={{ color: c.accent }} aria-hidden="true">✦</span>
      <span
        className="bk-display relative text-[clamp(0.8rem,9cqw,1.5rem)] leading-[1.12] [overflow-wrap:anywhere]"
        style={{ fontWeight: 600 }}
      >
        {title}
      </span>
      <span className="relative text-[clamp(0.45rem,4cqw,0.7rem)] uppercase tracking-[0.3em]" style={{ color: c.accent }}>
        Papelada
      </span>
    </div>
  )
}

/** Foto do livro ou, se não houver, a capa gerada. Preenche o contêiner pai. */
export function BookImage({
  src,
  title,
  className = 'h-full w-full object-cover',
}: {
  src?: string
  title: string
  className?: string
}) {
  if (!src) return <BookCover title={title} />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={title} className={className} />
}
