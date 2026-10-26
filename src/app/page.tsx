'use client'

import { Header, Footer } from '@/components/layout'
import { FaqSection } from '@/components/ui'
import { CartDrawer } from '@/components/cart'
import ChatAssistant from '@/components/ui/ChatAssistant'
import { Hero, CategoryChips, Deals, TeamPicks, BookCarousel, SectionHeading, BestSellers, CategoryGrid, VisitStore } from '@/components/home'
import { mockProducts } from '@/lib/data/products'

export default function HomePage() {
  const products = mockProducts
  const arrivals = products.filter((p) => p.section?.includes('novidades'))

  return (
    <>
      <Header />
      <CartDrawer />
      <ChatAssistant />
      <main className="min-h-screen bg-bg">
        {/* Tom por seção: escuro (hero, mais procurados) e claro (demais), com fundos claros alternados */}
        <div data-tone="dark">
          <Hero products={products} />
          <CategoryChips />
        </div>
        <div data-tone="light"><Deals products={products} /></div>
        <div data-tone="light" data-surface="alt"><TeamPicks products={products} /></div>
        <div data-tone="light">
          <section className="mx-auto max-w-[1200px] px-4 py-12 md:py-16" aria-labelledby="chegaram-titulo">
            <SectionHeading eyebrow="Lançamentos" title="Chegaram à estante" id="chegaram-titulo" href="/secao/novidades" linkLabel="Ver todos" />
            <BookCarousel books={arrivals.length > 0 ? arrivals : products} label="Chegaram à estante" />
          </section>
        </div>
        <div data-tone="dark"><BestSellers products={products} /></div>
        <div data-tone="light"><CategoryGrid /></div>
        <div data-tone="light" data-surface="alt"><VisitStore /></div>
        <div data-tone="light"><FaqSection /></div>
      </main>
      <Footer />
    </>
  )
}
