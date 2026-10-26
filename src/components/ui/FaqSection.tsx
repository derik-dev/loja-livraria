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
    <section id="duvidas" className="scroll-mt-32 px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-[900px]">
        <h2 className="z-plain mb-6 text-2xl font-semibold">Perguntas frequentes</h2>

        <div className="bk-card divide-y divide-[var(--bk-paper-2)] overflow-hidden">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={faq.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-[var(--bk-paper)]/60"
                >
                  <span className={`text-base font-medium ${isOpen ? 'text-[var(--bk-navy-2)]' : ''}`}>{faq.q}</span>
                  <svg className={`h-5 w-5 flex-shrink-0 text-[var(--bk-ink-soft)] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && <p className="px-6 pb-6 pr-14 text-[15px] leading-relaxed text-[var(--bk-ink-soft)]">{faq.a}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
