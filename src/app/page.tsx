'use client'

import { Header, Footer } from '@/components/layout'
import { CartDrawer } from '@/components/cart'
import ChatAssistant from '@/components/ui/ChatAssistant'
import { Hero, BenefitCards, Offers, PromoBanner, TeamPicks, BookCarousel, SectionHeading, Ranking, Collections, Authors, VideoSection, Testimonials, VisitStore, Faq, Newsletter, Blog, Publishers } from '@/components/home'
import { siteConfig } from '@/site.config'
import { mockProducts } from '@/lib/data/products'

export default function HomePage() {
  const products = mockProducts
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
          <section className="px-5 py-14 md:px-16 md:py-20" aria-labelledby="chegaram-titulo">
            <SectionHeading eyebrow="Lançamentos" title="Chegaram à estante" id="chegaram-titulo" href="/secao/novidades" linkLabel="Ver todos" center />
            <BookCarousel books={arrivals.length > 0 ? arrivals : products} label="Chegaram à estante" spread />
          </section>
        </div>
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
