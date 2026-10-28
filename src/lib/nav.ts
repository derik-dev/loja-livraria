// Seções do site. Os `slug` são os mesmos valores que o admin grava em products.section
// (masculino, feminino...), então só os rótulos mudaram — nenhum dado do banco precisa mudar.
export type ZineColor = 'yellow' | 'pink' | 'blue' | 'green' | 'red' | 'lilac'

export interface Section {
  slug: string
  label: string
  note: string
  color: ZineColor
  banner: string
}

export const SECTIONS: Section[] = [
  { slug: 'masculino', label: 'Ficção', note: 'histórias pra se perder', color: 'red', banner: '/banners/ficcao.png' },
  { slug: 'feminino', label: 'Não-ficção', note: 'o mundo, explicado', color: 'blue', banner: '/banners/nao-ficcao.png' },
  { slug: 'inverno', label: 'Clássicos', note: 'sobreviveram por um motivo', color: 'green', banner: '/banners/classicos.png' },
  { slug: 'tecnologia', label: 'Tecnologia & Ciência', note: 'pra quem quer entender', color: 'lilac', banner: '/banners/tecnologia-ciencia.png' },
  { slug: 'acessorios', label: 'Papelaria & Brindes', note: 'marcador, caderno, firula', color: 'pink', banner: '/banners/papelaria.png' },
  { slug: 'novidades', label: 'Novidades', note: 'acabou de chegar', color: 'yellow', banner: '/banners/novidades.png' },
]

export const COLOR_VAR: Record<ZineColor, string> = {
  yellow: 'var(--z-yellow)',
  pink: 'var(--z-pink)',
  blue: 'var(--z-blue)',
  green: 'var(--z-green)',
  red: 'var(--z-red)',
  lilac: 'var(--z-lilac)',
}

// Texto claro sobre estas cores, escuro sobre as demais
export const DARK_BG: ZineColor[] = ['blue', 'red']

export function sectionBySlug(slug: string) {
  return SECTIONS.find((s) => s.slug === slug)
}
