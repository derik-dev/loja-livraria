'use client'

import { useState, useEffect } from 'react'
import { Header, Footer } from '@/components/layout'
import { FaqSection } from '@/components/ui'
import { ProductShowcase } from '@/components/product'
import { CartDrawer } from '@/components/cart'
import ChatAssistant from '@/components/ui/ChatAssistant'
import { HomeHero, GenreTiles, Manifesto, TopFive } from '@/components/zine'
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
        <HomeHero products={products} />

        <ProductShowcase products={products} />

        <GenreTiles />

        <TopFive products={products} />

        <Manifesto />

        {/* ── LOJA FÍSICA ── */}
        <section className="border-t border-[var(--bk-line)] px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="bk-eyebrow">Loja física</p>
              <h2 className="bk-display mt-3 text-[clamp(2rem,4.4vw,3.4rem)]">Visite a livraria</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--bk-ink-soft)]">
                A {BRAND_NAME} também tem loja física. Venha folhear os livros com calma, conversar com a gente e levar o que ainda não estava na sua lista.
              </p>
              <a
                href="https://maps.google.com/?q=São+Paulo,SP"
                target="_blank"
                rel="noopener noreferrer"
                className="bk-btn mt-8"
              >
                Como chegar
              </a>
            </div>

            <div className="bk-frame p-2">
              <div className="w-full overflow-hidden" style={{ height: '380px' }}>
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
          </div>
        </section>

        {/* ── SOBRE ── */}
        <section className="border-y border-[var(--bk-line)] bg-[var(--bk-paper-2)]/60 px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="bk-eyebrow">Sobre a loja</p>
            <h2 className="bk-display mt-3 text-[clamp(2rem,4.4vw,3.4rem)]">Livros escolhidos com critério</h2>
            <div className="bk-ornament mx-auto mt-6 max-w-xs" aria-hidden="true">✦</div>
            <p className="bk-dropcap mt-8 text-left text-lg leading-relaxed text-[var(--bk-ink-soft)]">
              A {BRAND_NAME} é uma livraria feita por quem lê. Cada título do catálogo é escolhido pela equipe, cadastrado com preço e estoque reais e embalado com cuidado para chegar inteiro. Não pretendemos ter todos os livros do mundo: queremos ter os que valem a pena e ajudar você a encontrar o seu.
            </p>
          </div>
        </section>

        <FaqSection />
      </main>
      <Footer />
    </>
  )
}
