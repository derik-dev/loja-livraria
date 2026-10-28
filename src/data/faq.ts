import { siteConfig } from '@/site.config'

/** Perguntas frequentes (5). O valor do frete grátis vem do site.config. */
export const faq = {
  eyebrow: 'Atendimento',
  title: 'Perguntas frequentes',
  items: [
    { q: 'Quanto tempo leva para o livro chegar?', a: 'Depende do CEP. Na página do livro e no carrinho você vê as opções de envio com prazo antes de pagar.' },
    { q: 'A partir de quanto o frete é grátis?', a: `Em compras acima de R$ ${siteConfig.freeShippingThreshold}. O carrinho mostra quanto falta para chegar lá.` },
    { q: 'Posso trocar se o livro vier com defeito ou não for o que eu queria?', a: 'Pode. Você tem até 30 dias depois de receber para pedir a troca. É só falar com a gente.' },
    { q: 'Quais formas de pagamento vocês aceitam?', a: 'Hoje o pagamento é por Pix, com 2% de desconto.' },
    { q: 'Não sei o que ler. Alguém ajuda?', a: 'A Vera, nossa assistente de leitura (o botão no canto da tela), indica livros pelo seu gosto. Você também pode descrever o que procura na busca do catálogo, por exemplo "um romance leve para viagem".' },
  ],
}
