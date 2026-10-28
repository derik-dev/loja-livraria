/** Coleções da home (círculos). `icon` escolhe o desenho em components/home/Collections.tsx; `tone` escolhe a cor da paleta. */
export const collections = [
  { label: 'Livros', href: '/produtos', icon: 'book', tone: 'marrom' },
  { label: 'Cadernos', href: '/secao/acessorios', icon: 'notebook', tone: 'tan' },
  { label: 'Papelaria', href: '/secao/acessorios', icon: 'pen', tone: 'creme' },
  { label: 'Canecas', href: '/secao/acessorios', icon: 'mug', tone: 'vinho' },
  { label: 'Presentes', href: '/secao/acessorios', icon: 'gift', tone: 'marrom' },
  { label: 'Marcadores', href: '/secao/acessorios', icon: 'bookmark', tone: 'tan' },
  { label: 'Promoções', href: '/produtos', icon: 'tag', tone: 'vinho' },
] as const

export type CollectionTone = (typeof collections)[number]['tone']
