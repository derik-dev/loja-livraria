import Link from 'next/link'
import { blog } from '@/data/blog'
import SectionHeading from './SectionHeading'

/** Blog (opcional: site.config → sections.blog). Cartões simples; troque os dados em src/data/blog.ts. */
export default function Blog() {
  return (
    <section data-tone="light" className="bg-bg py-14 md:py-20" aria-labelledby="blog-titulo">
      <div className="container-page">
        <SectionHeading eyebrow={blog.eyebrow} title={blog.title} id="blog-titulo" />
        <ul className="grid gap-4 md:grid-cols-3">
          {blog.posts.map((post) => (
            <li key={post.title}>
              <Link href={post.href} className="surface surface-lift flex h-full flex-col p-6">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{post.tag}</span>
                <span className="mt-3 flex-1 text-xl leading-snug text-ink">{post.title}</span>
                <span className="mt-6 text-sm text-muted">{post.date}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
