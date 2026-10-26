import type { Product } from '@/lib/types'

/** Catálogo fictício usado para desenvolvimento e demonstração da loja. */
export const mockProducts: Product[] = [
  {
    id: 'demo-001',
    slug: 'cartas-ao-mar-de-dentro',
    name: 'Cartas ao Mar de Dentro',
    author: 'Marina Valença',
    description: 'Depois de anos longe da vila onde cresceu, Elisa volta para organizar a casa do avô e encontra cartas que nunca chegaram ao destino. Entre marés, silêncios e lembranças, ela descobre que algumas histórias ainda podem ser reescritas.',
    price: 48.9,
    originalPrice: 59.9,
    images: ['/covers/cartas-ao-mar.png'],
    category: 'ficcao',
    tags: ['romance literário', 'família', 'litoral', 'cartas'],
    rating: 4.8,
    reviewCount: 126,
    stock: 12,
    featured: true,
    features: ['Edição brochura', 'Papel pólen', 'Leitura para todas as idades'],
    section: ['masculino', 'novidades'],
    metaTitle: 'Cartas ao Mar de Dentro | Papelada',
    metaDescription: 'Um romance sobre cartas, marés e histórias que ainda podem ser reescritas.',
  },
  {
    id: 'demo-002',
    slug: 'jardim-das-coisas-perdidas',
    name: 'O Jardim das Coisas Perdidas',
    author: 'Lia Monteiro',
    description: 'No fundo de uma estufa esquecida, uma cadeira vermelha aparece todas as manhãs em um lugar diferente. Clara começa a seguir as pistas do jardim e encontra objetos, histórias e pessoas que a cidade julgava ter perdido para sempre.',
    price: 54.9,
    originalPrice: 64.9,
    images: ['/covers/jardim-das-coisas-perdidas.png'],
    category: 'realismo-magico',
    tags: ['realismo mágico', 'amizade', 'memória', 'jardim'],
    rating: 4.9,
    reviewCount: 83,
    stock: 7,
    featured: true,
    features: ['Edição brochura', 'Ilustrações em duas cores'],
    section: ['masculino', 'inverno', 'novidades'],
  },
  {
    id: 'demo-003',
    slug: 'arquivo-das-estrelas',
    name: 'O Arquivo das Estrelas',
    author: 'Caio Nascimento',
    description: 'Uma astrônoma encontra um mapa celeste que registra constelações ainda invisíveis. Para decifrá-lo, ela precisa atravessar uma cidade que parece mudar de lugar a cada noite e decidir o que vale a pena deixar registrado para o futuro.',
    price: 62.9,
    images: ['/covers/arquivo-das-estrelas.png'],
    category: 'ficcao-cientifica',
    tags: ['ficção científica', 'espaço', 'mistério', 'astronomia'],
    rating: 4.7,
    reviewCount: 61,
    stock: 9,
    featured: true,
    features: ['Edição brochura', 'Mapa celeste ilustrado'],
    section: ['tecnologia', 'masculino', 'novidades'],
  },
  {
    id: 'demo-004',
    slug: 'cafe-das-horas-impossiveis',
    name: 'Café das Horas Impossíveis',
    author: 'Bia Sampaio',
    description: 'Toda quinta-feira, duas pessoas que nunca se conheceram encontram bilhetes sobre a mesa do café. Quando os recados começam a falar de um futuro que ainda não aconteceu, os encontros ganham outro significado.',
    price: 44.9,
    originalPrice: 52.9,
    images: ['/covers/cafe-das-horas.png'],
    category: 'romance',
    tags: ['romance', 'encontros', 'cafeteria', 'leve'],
    rating: 4.6,
    reviewCount: 148,
    stock: 18,
    featured: true,
    features: ['Edição brochura', 'Leitura leve'],
    section: ['masculino', 'novidades'],
  },
  {
    id: 'demo-005',
    slug: 'vozes-da-rua-do-norte',
    name: 'As Vozes da Rua do Norte',
    author: 'Rafael Tavares',
    description: 'Uma restauradora de arquivos encontra três depoimentos contraditórios sobre o desaparecimento de um músico. Cada nova gravação muda o que ela acredita saber sobre a rua onde todos juram nunca ter ouvido nada.',
    price: 57.9,
    images: ['/covers/rua-do-norte.png'],
    category: 'suspense',
    tags: ['suspense', 'investigação', 'cidade', 'arquivos'],
    rating: 4.5,
    reviewCount: 72,
    stock: 5,
    featured: true,
    features: ['Edição brochura', 'Mistério urbano'],
    section: ['masculino', 'novidades'],
  },
  {
    id: 'demo-006',
    slug: 'atlas-das-pequenas-nuvens',
    name: 'Atlas das Pequenas Nuvens',
    author: 'Nina Campos',
    description: 'Uma criança recebe um atlas que mostra ilhas escondidas entre as nuvens. Em cada viagem, ela conhece novos moradores e aprende que mapas também podem guardar perguntas, sonhos e caminhos de volta.',
    price: 39.9,
    images: ['/covers/atlas-das-nuvens.png'],
    category: 'infantil',
    tags: ['infantil', 'aventura', 'imaginação', 'família'],
    rating: 4.9,
    reviewCount: 94,
    stock: 14,
    featured: false,
    features: ['Capa ilustrada', 'Indicado a partir de 7 anos'],
    section: ['masculino', 'novidades'],
  },
  {
    id: 'demo-007',
    slug: 'manual-para-recomecar-pequeno',
    name: 'Manual para Recomeçar Pequeno',
    author: 'Joana Reis',
    description: 'Ideias práticas para retomar projetos, cuidar da atenção e criar hábitos possíveis sem transformar a rotina em uma lista interminável de metas. Um convite a começar pelo que cabe no dia de hoje.',
    price: 46.9,
    originalPrice: 54.9,
    images: ['/covers/recomecar-pequeno.png'],
    category: 'nao-ficcao',
    tags: ['não ficção', 'hábitos', 'bem-estar', 'criatividade'],
    rating: 4.7,
    reviewCount: 105,
    stock: 11,
    featured: false,
    features: ['Exercícios curtos', 'Leitura prática'],
    section: ['feminino', 'novidades'],
  },
  {
    id: 'demo-008',
    slug: 'cozinha-de-domingo',
    name: 'Cozinha de Domingo',
    author: 'Teresa Avelar',
    description: 'Receitas para cozinhar sem pressa, com ingredientes simples e espaço para improvisar. De massas frescas a sobremesas de família, cada capítulo reúne pratos pensados para a mesa compartilhada.',
    price: 72.9,
    images: ['/covers/cozinha-de-domingo.png'],
    category: 'culinaria',
    tags: ['culinária', 'receitas', 'família', 'gastronomia'],
    rating: 4.8,
    reviewCount: 57,
    stock: 6,
    featured: false,
    features: ['Mais de 60 receitas', 'Fotografias coloridas'],
    section: ['feminino', 'novidades'],
  },
]

export function getMockProductBySlug(slug: string) {
  return mockProducts.find((product) => product.slug === slug)
}

export function getMockCategoryLabel(slug: string) {
  return mockCategories.find((category) => category.slug === slug)?.name ?? slug
}

export function searchMockProducts(query: string, limit = 6) {
  const terms = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .filter(Boolean)

  if (terms.length === 0) return []

  return mockProducts
    .map((product) => {
      const title = product.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
      const searchable = [product.name, product.author ?? '', product.description, product.category, ...product.tags]
        .join(' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
      const matched = terms.filter((term) => searchable.includes(term)).length
      return { product, score: matched + (title.includes(terms.join(' ')) ? 2 : 0) }
    })
    .filter((result) => result.score >= Math.max(1, Math.ceil(terms.length / 2)))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product)
}

export const mockCategories = [
  { slug: 'ficcao', name: 'Ficção' },
  { slug: 'realismo-magico', name: 'Realismo mágico' },
  { slug: 'ficcao-cientifica', name: 'Ficção científica' },
  { slug: 'romance', name: 'Romance' },
  { slug: 'suspense', name: 'Suspense e mistério' },
  { slug: 'infantil', name: 'Infantil' },
  { slug: 'nao-ficcao', name: 'Não ficção' },
  { slug: 'culinaria', name: 'Culinária' },
]
