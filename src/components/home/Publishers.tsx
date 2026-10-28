import { publishers } from '@/data/publishers'

/** Editoras (opcional: site.config → sections.publishers): nomes em texto numa faixa; troque por logos quando tiver. */
export default function Publishers() {
  return (
    <section data-tone="light" data-surface="alt" className="bg-bg py-12 md:py-14" aria-label={publishers.title}>
      <div className="container-page">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">{publishers.title}</p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {publishers.items.map((name) => (
            <li key={name} className="font-display text-lg text-ink md:text-2xl">{name}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
