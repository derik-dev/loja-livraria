interface PageHeroProps {
  title: string
  note: string
  /** Mantido por compatibilidade com as telas que ainda passam a cor; o tema escuro usa uma só superfície. */
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'red' | 'lilac'
}

/** Faixa de topo das páginas de listagem: superfície escura com brilho suave. */
export default function PageHero({ title, note }: PageHeroProps) {
  return (
    <section className="hero-glow border-b border-border bg-bg-alt">
      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-12 sm:pb-14 sm:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{note}</p>
        <h1 className="mt-2 text-[clamp(2.2rem,6vw,4rem)] text-ink">{title}</h1>
      </div>
    </section>
  )
}
