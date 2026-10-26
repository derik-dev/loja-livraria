import { BRAND_NAME } from '@/lib/brand'

/** Visite a livraria: texto à esquerda e mapa à direita. */
export default function VisitStore() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 md:py-16" aria-labelledby="visite-titulo">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Loja física</p>
          <h2 id="visite-titulo" className="mt-1.5 text-3xl text-ink md:text-4xl">Visite a livraria</h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
            A {BRAND_NAME} também tem loja física. Venha folhear os livros com calma, conversar com a gente e levar o que ainda não estava na sua lista.
          </p>
          <a
            href="https://maps.google.com/?q=São+Paulo,SP"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-7"
          >
            Como chegar
          </a>
        </div>

        <div className="h-[320px] overflow-hidden rounded-2xl border border-border bg-card md:h-[360px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.5!2d-46.6957!3d-23.6273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSanto+Amaro%2C+S%C3%A3o+Paulo%2C+SP!5e0!3m2!1spt-BR!2sbr!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa com a localização da loja"
          />
        </div>
      </div>
    </section>
  )
}
