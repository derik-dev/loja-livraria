// Gêneros usados nos filtros enquanto a tabela `categories` do Supabase não responde (ou está vazia).
export interface FilterCategory {
  slug: string
  name: string
}

export const fallbackCategories: FilterCategory[] = [
  { slug: 'romance', name: 'Romance' },
  { slug: 'fantasia', name: 'Fantasia' },
  { slug: 'suspense', name: 'Suspense e Policial' },
  { slug: 'ficcao-cientifica', name: 'Ficção científica' },
  { slug: 'biografias', name: 'Biografias' },
  { slug: 'historia', name: 'História' },
  { slug: 'infantil', name: 'Infantil' },
  { slug: 'quadrinhos', name: 'Quadrinhos e Mangás' },
]
