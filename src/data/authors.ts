/** Autores em destaque (seção opcional: site.config → sections.authors). `photo` é opcional; sem foto, o arco usa iniciais. */
export const authors = {
  eyebrow: 'Quem escreve',
  title: 'Autores em destaque',
  items: [
    { name: 'George Orwell', books: 2, tone: 'marrom' as const, photo: '' },
    { name: 'Machado de Assis', books: 2, tone: 'tan' as const, photo: '' },
    { name: 'J. R. R. Tolkien', books: 1, tone: 'vinho' as const, photo: '' },
    { name: 'Agatha Christie', books: 1, tone: 'creme' as const, photo: '' },
    { name: 'Yuval Noah Harari', books: 1, tone: 'marrom' as const, photo: '' },
  ],
}
