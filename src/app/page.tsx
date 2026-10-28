'use client'

import { Header, Footer } from '@/components/layout'
import { CartDrawer } from '@/components/cart'
import ChatAssistant from '@/components/ui/ChatAssistant'
import { Hero, BenefitCards, Offers, PromoBanner, TeamPicks, SectionHeading, Ranking, Collections, Authors, VideoSection, VideoArea, Testimonials, VisitStore, Faq, Newsletter, Blog, Publishers } from '@/components/home'
import ProductCard from '@/components/product/ProductCard'
import { siteConfig } from '@/site.config'
import { mockProducts } from '@/lib/data/products'

export default function HomePage() {
  // A home só mostra livros com capa real; os que ainda usam a capa gerada continuam no catálogo.
  const products = mockProducts.filter((p) => p.images.length > 0)
  const arrivals = products.filter((p) => p.section?.includes('novidades'))

  return (
    <>
      <Header overlay />
      <CartDrawer />
      <ChatAssistant />
      <main className="min-h-screen bg-bg">
        {/* Tom por seção: escuro (hero, mais procurados) e claro (demais), com fundos claros alternados */}
        <div data-tone="dark">
          <Hero />
        </div>
        <BenefitCards />
        <Offers products={products} />
        <PromoBanner />
        <TeamPicks products={products} />
        <div data-tone="light" className="overflow-x-clip bg-bg">
          <section className="container-page py-14 md:py-20" aria-labelledby="chegaram-titulo">
            <SectionHeading eyebrow="Lançamentos" title="Chegaram à estante" id="chegaram-titulo" href="/secao/novidades" linkLabel="Ver todos" center />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {(arrivals.length > 0 ? arrivals : products).slice(0, 4).map((book) => (
                <ProductCard key={book.id} product={book} variant="flat" sizes="(min-width: 1024px) 285px, 45vw" />
              ))}
            </div>
          </section>
        </div>
        <VideoArea />
        <Ranking products={products} />
        <Collections />
        {siteConfig.sections.authors && <Authors />}
        {siteConfig.sections.video && <VideoSection />}
        {siteConfig.sections.testimonials && <Testimonials />}
        {siteConfig.sections.physicalStore && <VisitStore />}
        <Faq />
        {siteConfig.sections.blog && <Blog />}
        {siteConfig.sections.publishers && <Publishers />}
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
