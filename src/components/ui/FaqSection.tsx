'use client'

import { useState } from 'react'

const faqs = [
  { q: 'Quanto tempo leva para o livro chegar?', a: 'Depende do CEP. Na página do livro e no carrinho você vê as opções de envio com prazo antes de pagar.' },
  { q: 'A partir de quanto o frete é grátis?', a: 'Em compras acima de R$ 399. O carrinho mostra quanto falta para chegar lá.' },
  { q: 'Posso trocar se o livro vier com defeito ou não for o que eu queria?', a: 'Pode. Você tem até 30 dias depois de receber para pedir a troca. É só falar com a gente.' },
  { q: 'Como sei se o livro está em estoque?', a: 'A página do livro mostra a disponibilidade. Se estiver esgotado, o botão de compra fica desativado.' },
  { q: 'Quais formas de pagamento vocês aceitam?', a: 'Hoje o pagamento é por Pix, com 2% de desconto.' },
  { q: 'Vocês têm loja física?', a: 'Temos. O endereço e o mapa estão na seção "Visite a livraria", logo acima.' },
  { q: 'Não sei o que ler. Alguém ajuda?', a: 'A Vera, nossa assistente de leitura (o botão no canto da tela), indica livros pelo seu gosto. Você também pode usar a busca do catálogo e descrever o que procura, por exemplo "um romance leve para viagem".' },
  { q: 'Dá para presentear?', a: 'Dá. No checkout há a opção de embalagem para presente.' },
]

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
      <div className="mx-auto max-w-[900px]">
        <div className="text-center">
          <p className="bk-eyebrow">Atendimento</p>
          <h2 className="bk-display mt-3 text-[clamp(2rem,4.4vw,3.4rem)]">Perguntas frequentes</h2>
          <div className="bk-ornament mx-auto mt-6 max-w-xs" aria-hidden="true">✦</div>
        </div>

        <div className="mt-12 border-y border-[var(--bk-ink)]">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={faq.q} className="border-b border-[var(--bk-line)] last:border-b-0">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className={`bk-display text-lg transition-colors sm:text-xl ${isOpen ? 'text-[var(--bk-burgundy)]' : ''}`} style={{ fontWeight: 600 }}>
                    {faq.q}
                  </span>
                  <span
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[var(--bk-ink)] text-lg leading-none transition-transform"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {isOpen && <p className="pb-6 pr-12 text-base leading-relaxed text-[var(--bk-ink-soft)]">{faq.a}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
