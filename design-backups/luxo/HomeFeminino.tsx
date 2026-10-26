'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout'
import { CartDrawer } from '@/components/cart'
import FooterFeminino from './FooterFeminino'
import ProductCardFeminino from './ProductCardFeminino'
import ChatAssistant from '@/components/ui/ChatAssistant'
import { supabaseAdmin as supabase, mapProduct } from '@/lib/supabase'
import { BRAND_NAME } from '@/lib/brand'
import type { Product } from '@/lib/types'

const unsplash = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`

const IMG = {
  hero: unsplash('1566174053879-31528523f8ae', 1200),
  vestidos: unsplash('1595777457583-95e059d581b8', 900),
  blusas: unsplash('1551163943-3f6a855d1153', 900),
  calcas: unsplash('1515886657613-9f3515b0c78f', 900),
  acessorios: unsplash('1584917865442-de89df76afd3', 900),
  alfaiataria: unsplash('1485968579580-b6d095142e6e', 1200),
}

const CATEGORIES = [
  { label: 'Vestidos', href: '/secao/feminino', image: IMG.vestidos },
  { label: 'Blusas', href: '/secao/feminino', image: IMG.blusas },
  { label: 'Calças', href: '/secao/feminino', image: IMG.calcas },
  { label: 'Acessórios', href: '/secao/acessorios', image: IMG.acessorios },
]

const ico = 'h-7 w-7'
const BENEFITS = [
  {
    title: 'Envio para todo o Brasil',
    text: 'Frete grátis a partir de R$ 199.',
    svg: (
      <svg className={ico} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: 'Troca sem burocracia',
    text: 'Até 30 dias para decidir.',
    svg: (
      <svg className={ico} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  {
    title: 'Pagamento seguro',
    text: 'Pix, cartão e boleto, com parcelamento.',
    svg: (
      <svg className={ico} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
]

export default function HomeFeminino() {
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    supabase.from('products').select('*').then(({ data, error }) => {
      if (error) console.error('[Supabase] home:', error)
      setProducts(data ? data.map(mapProduct) : [])
    })
  }, [])

  const novidades = (() => {
    if (!products) return []
    const marked = products.filter((p) => p.section?.includes('novidades'))
    return (marked.length > 0 ? marked : products).slice(0, 8)
  })()

  return (
    <>
      <Header overlay />
      <CartDrawer />
      <ChatAssistant />

      <main>
        {/* ── HERO ───────────────────────────────────────── */}
        <section className="fem-dark relative isolate overflow-hidden bg-[var(--theme-night)] text-[var(--theme-accent-ink)]">
          <div className="mx-auto grid min-h-[min(100svh,60rem)] max-w-[90rem] items-center gap-14 px-6 pb-20 pt-36 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-16 lg:pb-24 lg:pt-40">
            <div className="relative z-10 order-2 lg:order-1">
              <p className="fem-fade fem-caps text-[var(--theme-blush)]" style={{ animationDelay: '0.2s' }}>
                Coleção 2026
              </p>
              <h1 className="mt-7 text-[clamp(3.6rem,10.5vw,8.25rem)] leading-[0.98]">
                <span className="fem-line"><span style={{ animationDelay: '0.3s' }}>Ela não</span></span>
                <span className="fem-line"><span style={{ animationDelay: '0.42s' }}>pede</span></span>
                <span className="fem-line"><span className="text-[var(--theme-blush)]" style={{ animationDelay: '0.54s' }}>licença.</span></span>
              </h1>
              <p className="fem-fade mt-9 max-w-md text-lg leading-relaxed text-[var(--theme-soft-2)]" style={{ animationDelay: '0.9s' }}>
                Alfaiataria fluida e vestidos de presença para quem chega sabendo o que quer.
              </p>
              <div className="fem-fade mt-10 flex flex-wrap items-center gap-x-8 gap-y-5" style={{ animationDelay: '1.05s' }}>
                <Link href="/secao/feminino" className="fem-btn fem-btn--light">Ver coleção</Link>
                <Link href="/secao/novidades" className="fem-link fem-caps">Novidades</Link>
              </div>
            </div>

            <div className="relative order-1 mx-auto w-full max-w-sm lg:order-2 lg:max-w-none lg:pl-10">
              <div className="fem-frame">
                <div className="fem-arch fem-reveal relative aspect-[3/4.2] overflow-hidden bg-[var(--theme-accent)]">
                  <Image
                    src={IMG.hero}
                    alt="Mulher de perfil em vestido bordô sobre fundo violeta"
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 80vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <span
            className="fem-grow absolute bottom-0 left-1/2 hidden h-16 w-px bg-[var(--theme-blush)] lg:block"
            aria-hidden="true"
          />
        </section>

        {/* ── MANIFESTO ──────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-28 sm:px-10 sm:py-40" aria-label="Manifesto">
          <p className="fem-display text-[clamp(2.2rem,6vw,4.9rem)] text-[var(--theme-ink)]">
            Elegância não é pedir espaço.
            <br />
            É ocupar <span className="text-[var(--theme-rubi)]">o que já é seu.</span>
          </p>
          <div className="mt-12 flex items-center gap-5">
            <span className="h-px w-16 bg-[var(--theme-ink)]" aria-hidden="true" />
            <span className="fem-caps text-[var(--theme-ink-soft)]">{BRAND_NAME}</span>
          </div>
        </section>

        {/* ── CATEGORIAS ─────────────────────────────────── */}
        <section aria-label="Categorias">
          <ul className="grid grid-cols-2 gap-px bg-[var(--theme-line)] lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <li key={c.label} className="bg-[var(--theme-bg)]">
                <Link href={c.href} className="group relative block aspect-[3/4] overflow-hidden bg-[var(--theme-night)] lg:aspect-[3/4.4]">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover opacity-90 transition-[transform,opacity] duration-[1200ms] ease-out group-hover:scale-105 group-hover:opacity-100"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[var(--theme-night)]/80 via-transparent to-transparent" aria-hidden="true" />
                  <span className="absolute inset-x-5 bottom-6 flex items-end justify-between text-[var(--theme-accent-ink)] sm:inset-x-7 sm:bottom-8">
                    <span className="fem-display text-3xl sm:text-4xl">{c.label}</span>
                    <span className="mb-1 translate-x-0 text-xl transition-transform duration-500 group-hover:translate-x-2" aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── A COLEÇÃO ──────────────────────────────────── */}
        <section className="mx-auto max-w-[90rem] px-6 py-28 sm:px-10 sm:py-36 lg:px-16" aria-labelledby="fem-new">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <h2 id="fem-new" className="fem-display text-[clamp(2.8rem,7vw,5.5rem)] text-[var(--theme-ink)]">
              A coleção
            </h2>
            <Link href="/secao/novidades" className="fem-link fem-caps">Ver tudo</Link>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-14 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-20">
            {products === null
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse bg-[var(--theme-soft-1)]" aria-hidden="true" />
                ))
              : novidades.map((p) => <ProductCardFeminino key={p.id} product={p} />)}
          </div>
          {products !== null && novidades.length === 0 && (
            <p className="text-center text-[var(--theme-ink-soft)]">Novas peças chegando em breve.</p>
          )}
        </section>

        {/* ── BANNER DE DESTAQUE ─────────────────────────── */}
        <section className="fem-dark bg-[var(--theme-night)] text-[var(--theme-accent-ink)]" aria-labelledby="fem-banner">
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[44rem]">
              <Image
                src={IMG.alfaiataria}
                alt="Mulher de blazer escuro caminhando pela rua com bolsa estruturada"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start justify-center gap-8 px-6 py-20 sm:px-14 lg:px-20 lg:py-28">
              <p className="fem-caps text-[var(--theme-blush)]">Alfaiataria</p>
              <h2 id="fem-banner" className="fem-display text-[clamp(2.6rem,5.6vw,4.9rem)]">
                Da reunião ao jantar, sem trocar de postura.
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-[var(--theme-soft-2)]">
                Cortes precisos, tecidos que caem bem e peças que acompanham a sua agenda inteira.
              </p>
              <Link href="/secao/feminino" className="fem-btn fem-btn--ghost">Descobrir</Link>
            </div>
          </div>
        </section>

        {/* ── BENEFÍCIOS ─────────────────────────────────── */}
        <section aria-label="Benefícios">
          <ul className="mx-auto grid max-w-[90rem] divide-y divide-[var(--theme-line)] px-6 sm:px-10 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-16">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex flex-col items-center gap-4 px-6 py-14 text-center text-[var(--theme-ink)]">
                {b.svg}
                <h3 className="fem-display text-2xl">{b.title}</h3>
                <p className="max-w-[16rem] text-[var(--theme-ink-soft)]">{b.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <FooterFeminino />
    </>
  )
}
