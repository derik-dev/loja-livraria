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
    <section id="duvidas" className="mx-auto max-w-[760px] scroll-mt-6 px-4 py-12 md:py-16" aria-labelledby="faq-titulo">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Atendimento</p>
        <h2 id="faq-titulo" className="mt-1.5 text-3xl text-ink md:text-4xl">Perguntas frequentes</h2>
      </div>

      <div className="divide-y divide-border border-y border-border">
        {faqs.map((faq, i) => {
          const isOpen = open === i
          const panelId = `faq-panel-${i}`
          return (
            <div key={faq.q}>
              <h3 className="z-plain">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-medium text-ink transition-colors hover:text-accent"
                >
                  {faq.q}
                  <svg className={`h-5 w-5 shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </h3>
              {isOpen && <p id={panelId} className="pb-6 pr-10 text-[15px] leading-relaxed text-muted">{faq.a}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
