/**
 * Configuração do template. Para adaptar a loja para outra livraria, edite este arquivo
 * e os dados em src/data/books.ts: nome, textos, cores, links, endereço e seções ligáveis.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME ?? 'Papelada',
  tagline: 'livraria · catálogo de livros',
  description: 'Catálogo de livros: ficção, não ficção, clássicos e muito mais.',

  /** Logo: o ícone é desenhado em SVG (components/ui/BrandLogo); troque `image` para usar um arquivo em /public. */
  logo: {
    image: null as string | null,
    subtitle: 'Livraria',
  },

  /** Cores da marca. Viram os tokens do Tailwind (bg-espresso, text-tan, ...) via style no <html>. */
  colors: {
    espresso: '#2B1B14',
    espressoDeep: '#1E120D',
    creme: '#FFFFFF',
    cremeCard: '#F6F6F6',
    tan: '#D9A66B',
    marromMedio: '#8A5A3B',
    vinho: '#4A1F2A',
  },

  /** Banner de oferta em faixa (selo carimbado + texto girando). Textos fictícios: edite à vontade. */
  promoBanner: {
    eyebrow: 'Semana dos clássicos',
    title: 'Os livros que ficam, com até 40% de desconto.',
    text: 'Orwell, Machado, Bradbury e outros nomes que nunca saem de moda. Oferta por tempo limitado, enquanto durar o estoque.',
    stamp: '-40%',
    ringText: 'CLÁSSICOS COM PREÇO DE FEIRA • ATÉ 40% OFF • ',
    primaryCta: { label: 'Ver os clássicos', href: '/secao/inverno' },
    secondaryCta: { label: 'Todo o catálogo', href: '/produtos' },
  },

  /** Vídeo (seção opcional): a imagem de capa abre um modal; o vídeo só carrega depois do clique. `youtubeId` vazio = aviso no modal. */
  video: {
    eyebrow: 'Por dentro da livraria',
    title: 'Um passeio pelas nossas estantes',
    text: 'Veja como escolhemos, embalamos e enviamos cada livro.',
    poster: '/banners/ficcao.png',
    posterAlt: 'Estantes de uma livraria com luz quente',
    youtubeId: '',
  },

  /**
   * Área de vídeo entre "Chegaram à estante" e "Mais procurados": o vídeo à esquerda e um texto sobre a experiência da livraria à direita.
   * Coloque o arquivo em public/videos/ e aponte aqui (ex.: '/videos/loja.mp4'). Vazio = a área aparece vazia.
   */
  videoArea: {
    src: '/videos/video.mp4',
    poster: '',
    eyebrow: 'A experiência Papelada',
    title: 'Mais que comprar: um lugar para ficar.',
    text: 'Na nossa livraria o livro certo encontra você entre estantes de madeira, café quente e atendimento de quem lê. Folheie com calma, peça uma indicação e leve para casa tudo embalado com cuidado.',
    cta: { label: 'Conheça a loja', href: '/#loja' },
    /** Texto que gira no selo sobre o vídeo. */
    badge: 'VISITE A LOJA • ABERTO TODOS OS DIAS • ',
    /** Números que contam de 0 até o valor quando a seção aparece (dados fictícios: troque pelos reais). */
    stats: [
      { value: 12000, prefix: '+', decimals: 0, label: 'livros no acervo' },
      { value: 15, prefix: '', decimals: 0, label: 'anos de estante' },
      { value: 4.9, prefix: '', decimals: 1, label: 'nota dos leitores' },
    ],
  },

  newsletter: {
    title: 'Receba os próximos lançamentos',
    text: 'Um e-mail por semana com livros novos, ofertas e indicações. Sem spam.',
    placeholder: 'Seu melhor e-mail',
    button: 'Quero receber',
    success: 'Pronto! Você está na lista. Confira sua caixa de entrada.',
  },

  /** Frete grátis a partir deste valor (R$). */
  freeShippingThreshold: 399,

  /** Frases que rodam na barra de aviso do topo. */
  announcements: [
    'Frete grátis acima de R$ 399',
    '2% off no Pix',
    'Troca em até 30 dias',
    'Embalagem que protege a capa',
    'Retire na loja física, sem frete',
  ],

  hero: {
    eyebrow: 'Livraria independente',
    title: 'Uma vida maior cabe em um livro.',
    highlight: 'vida maior',
    subtitle: 'Ficção, não ficção e clássicos escolhidos por quem gosta de ler, com entrega para todo o Brasil.',
    primaryCta: { label: 'Ver ofertas', href: '/produtos' },
    secondaryCta: { label: 'Lançamentos', href: '/secao/novidades' },
  },

  /** Quatro benefícios que aparecem invadindo a base do hero. */
  benefits: [
    { title: 'Frete grátis', text: 'Acima de R$ 399 para todo o Brasil' },
    { title: 'Pix com 2% off', text: 'Pague na hora e economize' },
    { title: 'Troca em 30 dias', text: 'Sem burocracia e sem complicação' },
    { title: 'Embalagem cuidadosa', text: 'A capa chega como saiu da estante' },
  ],

  links: {
    track: '/rastreio',
    help: '/#duvidas',
    store: '/#loja',
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
    instagram: '',
  },

  /** Loja física (usada no mapa e no rodapé). */
  address: {
    street: 'Rua das Palmeiras, 120',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zip: '01000-000',
    hours: 'Seg a sáb, das 10h às 19h',
    phone: '(11) 4000-0000',
    mapQuery: 'Rua das Palmeiras 120, São Paulo',
  },

  /** Seções ligáveis/desligáveis da home. */
  sections: {
    authors: true,
    video: false,
    blog: false,
    publishers: false,
    testimonials: true,
    physicalStore: true,
  },
}

export type SiteConfig = typeof siteConfig
