/** Autores em destaque (seção opcional: site.config → sections.authors). Só os nomes: a contagem de livros e o link vêm do catálogo (lib/authors.ts). `photo` é opcional; sem foto, o arco usa iniciais. */
export const authors = {
  eyebrow: 'Quem escreve',
  title: 'Autores em destaque',
  items: [
    { name: 'George Orwell', tone: 'marrom' as const, photo: '' },
    { name: 'Machado de Assis', tone: 'tan' as const, photo: '' },
    { name: 'J. R. R. Tolkien', tone: 'vinho' as const, photo: '' },
    { name: 'Agatha Christie', tone: 'creme' as const, photo: '' },
    { name: 'Yuval Noah Harari', tone: 'marrom' as const, photo: '' },
  ],
}
