/**
 * Escolha da equipe. DADOS FICTÍCIOS: edite livremente (quem indicou, a frase e o livro).
 * `slug` aponta para um livro de src/data/books.ts; livros que não existirem no catálogo são ignorados.
 */
export const teamPicks = {
  eyebrow: 'Curadoria',
  title: 'Escolha da equipe',
  photo: '/banners/classicos.png',
  photoAlt: 'Estantes de uma livraria com luz quente',
  caption: 'Quem trabalha entre as estantes indica.',
  picks: [
    { slug: 'a-biblioteca-da-meia-noite', by: 'Marina', role: 'livreira', quote: 'Para quem precisa lembrar que ainda dá tempo de escolher de novo.' },
    { slug: 'a-revolucao-dos-bichos', by: 'Caio', role: 'atendimento', quote: 'O livro que eu mais empresto, e que sempre volta.' },
    { slug: 'neuromancer', by: 'Helena', role: 'curadoria', quote: 'Onde começou tudo o que a gente chama de cyberpunk hoje.' },
  ],
}
