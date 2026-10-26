'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/brand'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { BookImage } from './BookCover'

interface Slide {
  eyebrow: string
  title: string
  text: string
  cta: { label: string; href: string }
  badge: string
}

/** Banner rotativo da home. Os números exibidos vêm do catálogo e das regras reais da loja. */
export default function HomeBanner({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const maxDiscount = products.reduce(
    (max, p) => (p.originalPrice ? Math.max(max, calculateDiscount(p.originalPrice, p.price)) : max),
    0,
  )

  const slides: Slide[] = [
    maxDiscount > 0
      ? {
          eyebrow: 'Ofertas no catálogo',
          title: 'Leituras com descontos de verdade',
          text: 'Títulos selecionados com preço reduzido enquanto durar o estoque.',
          cta: { label: 'Ver ofertas', href: '/produtos' },
          badge: `até ${maxDiscount}% OFF`,
        }
      : {
          eyebrow: 'Catálogo completo',
          title: 'Encontre o seu próximo livro',
          text: 'Ficção, não ficção, clássicos e papelaria, com preço claro e estoque à vista.',
          cta: { label: 'Explorar catálogo', href: '/produtos' },
          badge: 'novos títulos',
        },
    {
      eyebrow: 'Entrega para todo o Brasil',
      title: `Frete grátis acima de ${formatCurrency(FREE_SHIPPING_THRESHOLD)}`,
      text: 'Junte alguns livros no carrinho e a entrega sai por nossa conta.',
      cta: { label: 'Montar meu pedido', href: '/produtos' },
      badge: 'frete grátis',
    },
    {
      eyebrow: 'Pagamento',
      title: 'Pague com Pix e ganhe 2% de desconto',
      text: 'O desconto é aplicado automaticamente no pagamento.',
      cta: { label: 'Ver livros', href: '/produtos' },
      badge: '2% OFF no Pix',
    },
  ]

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000)
    return () => clearInterval(t)
  }, [paused, slides.length])

  const covers = [...products].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 3)
  const slide = slides[index]

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#fbf6e6] via-[#f3e6bd] to-[#e8cf86]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrossel"
    >
      <div className="mx-auto grid min-h-[330px] max-w-[1200px] items-center gap-6 px-6 pb-28 pt-10 sm:px-16 md:min-h-[400px] md:grid-cols-[1.15fr_1fr] md:pb-32">
        <div key={index} className="bk-rise">
          <p className="bk-eyebrow !text-[var(--bk-navy-2)]">{slide.eyebrow}</p>
          <h1 className="bk-display mt-3 text-[clamp(1.9rem,4vw,3.2rem)] text-[var(--bk-navy)]">{slide.title}</h1>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-[var(--bk-ink)]/80">{slide.text}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href={slide.cta.href} className="bk-btn">{slide.cta.label}</Link>
            <span className="rounded-full border-2 border-[var(--bk-navy)] px-4 py-1.5 text-sm font-bold text-[var(--bk-navy)]">{slide.badge}</span>
          </div>
        </div>

        <div className="relative hidden h-[270px] md:block" aria-hidden="true">
          {covers.map((p, i) => (
            <Link
              key={p.id}
              href={`/produto/${p.slug}`}
              tabIndex={-1}
              className="bk-cover absolute block overflow-hidden"
              style={{
                width: 150,
                height: 225,
                left: `${14 + i * 28}%`,
                top: i === 1 ? 0 : 28,
                zIndex: i === 1 ? 2 : 1,
                transform: `rotate(${(i - 1) * 6}deg)`,
              }}
            >
              <BookImage src={p.images[0]} title={p.name} />
            </Link>
          ))}
        </div>
      </div>

      {/* Setas */}
      <button
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        aria-label="Slide anterior"
        className="absolute left-0 top-[40%] hidden h-16 w-12 -translate-y-1/2 items-center justify-center rounded-r-md bg-white/90 text-[var(--bk-navy)] shadow transition-colors hover:bg-white sm:flex"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        aria-label="Próximo slide"
        className="absolute right-0 top-[40%] hidden h-16 w-12 -translate-y-1/2 items-center justify-center rounded-l-md bg-white/90 text-[var(--bk-navy)] shadow transition-colors hover:bg-white sm:flex"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-[88px] left-1/2 flex -translate-x-1/2 gap-2 md:bottom-[100px]">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Ir para o slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-[var(--bk-navy)]' : 'w-2 bg-[var(--bk-navy)]/35'}`}
          />
        ))}
      </div>
    </section>
  )
}
