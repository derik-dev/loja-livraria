'use client'

import { useState, useEffect } from 'react'
import { Header, Footer } from '@/components/layout'
import { FaqSection } from '@/components/ui'
import { ProductShowcase } from '@/components/product'
import { CartDrawer } from '@/components/cart'
import ChatAssistant from '@/components/ui/ChatAssistant'
import { HomeBanner, ShortcutCards, DealsRow, GenreTiles, TopFive } from '@/components/zine'
import { supabaseAdmin as supabase, mapProduct } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import { BRAND_NAME } from '@/lib/brand'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    supabase.from('products').select('*').then(({ data, error }) => {
      if (error) console.error('[Supabase] home:', error)
      if (data) setProducts(data.map(mapProduct))
    })
  }, [])

  return (
    <>
      <Header />
      <CartDrawer />
      <ChatAssistant />
      <main className="min-h-screen">
        {/* Marfim: banner, atalhos, ofertas, estante */}
        <HomeBanner products={products} />
        <ShortcutCards />
        <DealsRow products={products} />
        <ProductShowcase products={products} />

        {/* Branco: mais procurados */}
        <TopFive products={products} />

        {/* Marfim: categorias */}
        <GenreTiles />

        {/* Branco: loja física e sobre */}
        <section className="bg-white px-4 py-14 sm:px-6">
          <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="bk-eyebrow">Loja física</p>
              <h2 className="bk-display mt-2 text-[clamp(1.8rem,3.4vw,2.6rem)] text-[var(--bk-navy)]">Visite a livraria</h2>
              <p className="mt-4 max-w-md text-[17px] leading-relaxed text-[var(--bk-ink-soft)]">
                A {BRAND_NAME} também tem loja física. Venha folhear os livros com calma, conversar com a gente e levar o que ainda não estava na sua lista.
              </p>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--bk-ink-soft)]">
                No catálogo, cada título é escolhido pela equipe, cadastrado com preço e estoque reais e embalado com cuidado para chegar inteiro.
              </p>
              <a
                href="https://maps.google.com/?q=São+Paulo,SP"
                target="_blank"
                rel="noopener noreferrer"
                className="bk-btn mt-6"
              >
                Como chegar
              </a>
            </div>

            <div className="overflow-hidden rounded-lg shadow-[0_1px_2px_rgb(20_40_75/0.14)]" style={{ height: '340px' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.5!2d-46.6957!3d-23.6273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSanto+Amaro%2C+S%C3%A3o+Paulo%2C+SP!5e0!3m2!1spt-BR!2sbr!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da loja"
              />
            </div>
          </div>
        </section>

        {/* Marfim: dúvidas */}
        <FaqSection />
      </main>
      <Footer />
    </>
  )
}
