const PERKS = [
  { title: 'Entrega para todo o Brasil', text: 'Frete grátis em compras acima de R$ 399. Abaixo disso, você vê as opções e os prazos antes de pagar.' },
  { title: 'Pagamento seguro', text: 'Pague por Pix e ganhe 2% de desconto. O ambiente de compra é protegido do começo ao fim.' },
  { title: 'Troca em até 30 dias', text: 'Se o livro não for o que você esperava, a gente troca, sem burocracia.' },
  { title: 'Atendimento de verdade', text: 'Dúvida sobre qual livro levar? Fale com a gente ou com a Vera, nossa assistente de leitura.' },
]

/** Faixa de serviços: quatro colunas separadas por filetes. */
export default function Manifesto() {
  return (
    <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid border-y-[3px] border-double border-[var(--bk-ink)] sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p, i) => (
            <div
              key={p.title}
              className={`px-6 py-8 text-center ${i > 0 ? 'border-t border-[var(--bk-line)] sm:border-t-0' : ''} ${i % 2 === 1 ? 'sm:border-l' : ''} ${i > 0 ? 'lg:border-l' : ''} ${i === 2 ? 'sm:border-t' : ''} ${i === 3 ? 'sm:border-t' : ''} lg:border-t-0 border-[var(--bk-line)]`}
            >
              <span className="text-[10px] text-[var(--bk-gold)]" aria-hidden="true">✦</span>
              <p className="bk-display mt-2 text-xl" style={{ fontWeight: 600 }}>{p.title}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--bk-ink-soft)]">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
