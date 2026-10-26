interface PageHeroProps {
  title: string
  note: string
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'red' | 'lilac'
}

const BG: Record<NonNullable<PageHeroProps['color']>, string> = {
  yellow: 'var(--z-yellow)',
  pink: 'var(--z-pink)',
  blue: 'var(--z-blue)',
  green: 'var(--z-green)',
  red: 'var(--z-red)',
  lilac: 'var(--z-lilac)',
}

const LIGHT_TEXT = new Set(['blue', 'red'])

/** Faixa de topo das páginas de listagem. */
export default function PageHero({ title, note, color = 'yellow' }: PageHeroProps) {
  const light = LIGHT_TEXT.has(color)
  const words = Array.from({ length: 8 }, () => title)
  return (
    <section className="relative overflow-hidden border-b-[3px] border-[var(--z-ink)]" style={{ background: BG[color], color: light ? '#fff9ea' : 'var(--z-ink)' }}>
      <div className={`absolute inset-0 ${light ? 'z-halftone--light' : 'z-halftone'} opacity-70`} aria-hidden="true" />
      <div className="relative px-4 pb-10 pt-10 sm:px-14 sm:pb-14 sm:pt-14 lg:px-20">
        <p className="z-hand text-2xl sm:text-3xl" style={{ transform: 'rotate(-2deg)' }}>{note}</p>
        <h1 className="z-display mt-1 text-[clamp(2.6rem,9vw,7rem)]">{title}</h1>
      </div>
      <div className="z-marquee overflow-hidden border-t-[3px] border-[var(--z-ink)] bg-[var(--z-ink)] py-2" aria-hidden="true">
        <div className="z-marquee-track">
          {[0, 1].map((pass) => (
            <span key={pass} className="flex items-center">
              {words.map((w, i) => (
                <span key={i} className="z-display flex items-center gap-5 px-5 text-sm text-[var(--z-yellow)]">
                  {w}
                  <span className="text-[var(--z-pink)]">✶</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
