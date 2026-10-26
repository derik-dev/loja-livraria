'use client'

import { useState, use, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { supabaseAdmin as supabase, mapProduct } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/context/AuthContext'
import { ProductGallery, ProductGrid } from '@/components/product'
import { BookImage } from '@/components/zine'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

// Usados quando o cadastro do livro não traz formatos / diferenciais
const DEFAULT_FORMATS = ['Brochura', 'Capa dura', 'E-book']

const DEFAULT_FEATURES = [
  'Embalagem que protege a capa',
  'Nota fiscal em todas as compras',
  'Troca em até 30 dias',
]

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

// ── Sub-components ───────────────────────────────────────────
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
  return (
    <div className="flex" aria-label={`Nota ${rating} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`${dim} ${i + 1 <= Math.round(rating) ? 'text-[var(--z-red)]' : 'text-zinc-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function AccordionItem({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t-[3px] border-[var(--z-ink)] first:border-t-0">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between py-4 text-left">
        <span className="z-display text-lg">{title}</span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full border-[2.5px] border-[var(--z-ink)] bg-[var(--z-paper)] font-bold transition-transform"
          style={{ transform: open ? 'rotate(45deg)' : 'none' }}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  )
}

const label = 'mb-2.5 block text-[11px] font-bold uppercase tracking-[0.16em]'

// ── Page ─────────────────────────────────────────────────────
export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [aiRecs, setAiRecs] = useState<Product[]>([])
  const [aiRecsLoading, setAiRecsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(0)
  const [cep, setCep] = useState('')
  const [shippingResult, setShippingResult] = useState<{ label: string; price: string; days: string }[] | null>(null)
  const [calculatingShipping, setCalculatingShipping] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { user, openAuthModal } = useAuth()

  useEffect(() => {
    supabase.from('products').select('*').eq('slug', slug).single().then(({ data }) => {
      if (!data) { setLoading(false); return }
      const p = mapProduct(data)
      setProduct(p)
      supabase.from('products').select('*').eq('category', p.category).neq('slug', slug).limit(3)
        .then(({ data: rel }) => setRelated((rel ?? []).map(mapProduct)))
      setLoading(false)
      // Recomendações por IA
      setAiRecsLoading(true)
      supabase.from('products').select('*').then(({ data: all }) => {
        const allMapped = (all ?? []).map(mapProduct)
        fetch('/api/ai/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentProduct: p, allProducts: allMapped }),
        })
          .then((r) => r.json())
          .then((d) => setAiRecs(d.products ?? []))
          .catch(() => {})
          .finally(() => setAiRecsLoading(false))
      })
    })
  }, [slug])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="z-hand text-3xl">folheando…</p>
    </div>
  )
  if (!product) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="z-card -rotate-2 bg-[var(--z-pink)] px-8 py-6">
        <p className="z-display text-4xl">Página 404</p>
        <p className="z-hand text-2xl">esse livro fugiu da estante</p>
      </div>
      <Link href="/produtos" className="z-btn z-btn--ink">Ver todos os livros</Link>
    </div>
  )

  const wishlisted = isWishlisted(product.id)

  const handleCalculateShipping = () => {
    if (cep.replace(/\D/g, '').length < 8) return
    setCalculatingShipping(true)
    setTimeout(() => {
      setShippingResult([
        { label: 'PAC', price: 'R$ 19,90', days: '5-8 dias úteis' },
        { label: 'SEDEX', price: 'R$ 34,90', days: '1-3 dias úteis' },
      ])
      setCalculatingShipping(false)
    }, 800)
  }

  const colors = product.colors ?? []
  const formats = product.sizes && product.sizes.length > 0 ? product.sizes : DEFAULT_FORMATS
  const productFeatures = product.features && product.features.length > 0 ? product.features : DEFAULT_FEATURES
  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : null

  const handleAddToCart = () => {
    if (!user) {
      openAuthModal()
      return
    }
    addItem(product, quantity, colors[selectedColor]?.name, selectedSize ?? undefined)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const ctaLabel = added ? '✓ Na sacola!' : product.stock === 0 ? 'Esgotado' : 'Colocar na sacola'

  return (
    <div className="pb-24 md:pb-0">
      {/* Trilha */}
      <div className="px-4 pt-5 sm:px-14 lg:px-20">
        <p className="text-xs font-bold uppercase tracking-[0.14em]">
          <Link href="/" className="hover:underline">Início</Link>
          <span className="mx-2 text-[var(--z-red)]">✶</span>
          <Link href="/produtos" className="hover:underline">Livros</Link>
          <span className="mx-2 text-[var(--z-red)]">✶</span>
          <span className="text-zinc-500">{product.category}</span>
        </p>
      </div>

      {/* ── Capa + ficha ── */}
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-8 sm:px-14 md:grid-cols-[1fr_1fr] lg:gap-16 lg:px-20 lg:py-12">
        <div className="md:sticky md:top-28 md:self-start">
          <ProductGallery images={product.images} alt={product.name} />
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            {product.featured && <span className="z-sticker" style={{ background: 'var(--z-pink)', ['--r' as string]: '-4deg' }}>Queridinho</span>}
            {discount && <span className="z-sticker" style={{ background: 'var(--z-red)', color: '#fff9ea', ['--r' as string]: '3deg' }}>-{discount}%</span>}
            {!product.featured && !discount && <span className="z-sticker" style={{ background: 'var(--z-green)', ['--r' as string]: '-3deg' }}>Novo</span>}
            {product.reviewCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <Stars rating={product.rating} /> {product.rating} · {product.reviewCount.toLocaleString('pt-BR')} leitores
              </span>
            )}
          </div>

          <h1 className="text-xl">{product.name}</h1>

          <div className="mt-6 flex items-baseline gap-3 border-y-[3px] border-[var(--z-ink)] py-5">
            <span className="z-display text-5xl">{formatCurrency(product.price)}</span>
            {product.originalPrice && <span className="text-base font-medium text-zinc-400 line-through">{formatCurrency(product.originalPrice)}</span>}
          </div>

          {/* Formato */}
          <div className="mt-6">
            <span className={label}>Formato</span>
            <div className="flex flex-wrap gap-2.5">
              {formats.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                  aria-pressed={s === selectedSize}
                  className="border-[3px] border-[var(--z-ink)] px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{
                    background: s === selectedSize ? 'var(--z-yellow)' : '#fffdf6',
                    boxShadow: s === selectedSize ? '4px 4px 0 var(--z-ink)' : 'none',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Edição / capa (só se o cadastro tiver cores) */}
          {colors.length > 0 && (
            <div className="mt-6">
              <span className={label}>Edição: <span className="font-medium normal-case tracking-normal">{colors[selectedColor]?.name}</span></span>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    title={color.name}
                    aria-label={color.name}
                    aria-pressed={i === selectedColor}
                    className="h-9 w-9 rounded-full border-[3px] border-[var(--z-ink)] transition-transform hover:scale-110"
                    style={{ backgroundColor: color.hex, boxShadow: i === selectedColor ? '3px 3px 0 var(--z-ink)' : 'none', transform: i === selectedColor ? 'translate(-1px,-1px)' : undefined }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantidade */}
          <div className="mt-6">
            <span className={label}>Quantidade</span>
            <div className="inline-flex items-center border-[3px] border-[var(--z-ink)] bg-[#fffdf6]">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Diminuir"
                className="flex h-11 w-11 items-center justify-center text-xl font-bold hover:bg-[var(--z-yellow)]"
              >
                −
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={product.stock === 0}
                aria-label="Aumentar"
                className="flex h-11 w-11 items-center justify-center text-xl font-bold hover:bg-[var(--z-yellow)] disabled:opacity-30"
              >
                +
              </button>
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="z-hand ml-4 text-2xl text-[var(--z-red)]">só restam {product.stock}!</span>
            )}
          </div>

          {/* Comprar */}
          <div className="mt-8 hidden gap-3 md:flex md:flex-col">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="z-btn z-btn--red w-full !py-5 !text-lg disabled:opacity-50">
              {ctaLabel}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => toggleWishlist(product.id)}
                className="z-btn z-btn--paper flex-1 !py-3 !text-sm"
                aria-pressed={wishlisted}
              >
                {wishlisted ? '♥ Salvo' : '♡ Salvar'}
              </button>
              {WHATSAPP && (
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Oi! Queria saber mais sobre o livro "${product.name}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="z-btn z-btn--green flex-1 !py-3 !text-sm"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {product.stock > 0 && (
            <p className="mt-5 border-[3px] border-dashed border-[var(--z-ink)] px-4 py-3 text-center text-sm font-bold">
              Livro em estoque com <span className="z-mark">envio imediato</span>
            </p>
          )}

          {/* Frete */}
          <div className="mt-6">
            <span className={label}>Calcular frete</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="00000-000"
                value={cep}
                maxLength={9}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 8)
                  setCep(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v)
                  setShippingResult(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculateShipping()}
                className="flex-1 px-3 py-2.5 text-sm"
              />
              <button onClick={handleCalculateShipping} disabled={calculatingShipping} className="z-btn z-btn--ink !px-5 !py-2.5 !text-xs disabled:opacity-50">
                {calculatingShipping ? '…' : 'OK'}
              </button>
            </div>
            {shippingResult && (
              <div className="mt-3 divide-y-2 divide-[var(--z-ink)] border-[3px] border-[var(--z-ink)] bg-[#fffdf6]">
                {shippingResult.map((opt) => (
                  <div key={opt.label} className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <span><strong>{opt.label}</strong> <span className="text-zinc-500">· {opt.days}</span></span>
                    <strong>{opt.price}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="mt-10 border-[3px] border-[var(--z-ink)] bg-[#fffdf6] px-5 shadow-[7px_7px_0_var(--z-ink)]">
            <AccordionItem title="Sobre o livro" defaultOpen>
              <p className="whitespace-pre-line text-[15px] font-medium leading-relaxed">{product.description || 'Em breve, mais detalhes sobre este livro.'}</p>
            </AccordionItem>
            <AccordionItem title="Por que levar">
              <ul className="space-y-2.5">
                {productFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[15px] font-medium">
                    <span className="mt-0.5 text-[var(--z-red)]" aria-hidden="true">✶</span>
                    {item}
                  </li>
                ))}
              </ul>
            </AccordionItem>
            <AccordionItem title="Ficha técnica">
              <dl className="divide-y-2 divide-dashed divide-[var(--z-ink)]/30 text-sm">
                {[
                  ['Gênero', product.category],
                  ['Nota', product.reviewCount > 0 ? `${product.rating} / 5` : 'ainda sem avaliações'],
                  ['Estoque', product.stock > 0 ? `${product.stock} unidades` : 'esgotado'],
                  ['Referência', `REF-${product.id.padStart(5, '0')}`],
                ].map(([l, v]) => (
                  <div key={l} className="flex py-2.5">
                    <dt className="w-28 flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">{l}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              {product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((t, i) => (
                    <span key={t} className="z-sticker" style={{ ['--r' as string]: `${i % 2 ? 3 : -3}deg`, background: ['var(--z-yellow)', 'var(--z-pink)', 'var(--z-green)', 'var(--z-lilac)'][i % 4] }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </AccordionItem>
          </div>
        </div>
      </div>

      {/* ── Nota dos leitores ── */}
      {product.reviewCount > 0 && (
        <section className="border-y-[3px] border-[var(--z-ink)] bg-[var(--z-lilac)] px-4 py-14 sm:px-14 lg:px-20">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-6">
              <p className="z-display text-8xl leading-none">{product.rating}</p>
              <div>
                <Stars rating={product.rating} size="lg" />
                <p className="mt-2 text-sm font-bold">de {product.reviewCount.toLocaleString('pt-BR')} leitores</p>
              </div>
            </div>
            <p className="z-hand text-3xl sm:text-4xl">quem leu, recomenda a conversa</p>
          </div>
        </section>
      )}

      {/* ── Você também pode gostar (IA) ── */}
      <section className="px-4 py-16 sm:px-14 lg:px-20">
        <div className="mx-auto max-w-[1400px]">
          <p className="z-hand text-2xl sm:text-3xl">quem levou esse, olhou também</p>
          <h2 className="z-display mb-10 text-[clamp(2rem,5vw,3.8rem)]">Próxima leitura</h2>

          {aiRecsLoading ? (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] w-full border-[3px] border-[var(--z-ink)] bg-[var(--z-paper-2)]" />
                  <div className="mt-3 h-3 w-3/4 bg-[var(--z-paper-2)]" />
                  <div className="mt-2 h-3 w-1/2 bg-[var(--z-paper-2)]" />
                </div>
              ))}
            </div>
          ) : aiRecs.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {aiRecs.map((p, i) => (
                <Link key={p.id} href={`/produto/${p.slug}`} className="group block">
                  <div
                    className="z-lift overflow-hidden border-[3px] border-[var(--z-ink)] bg-[var(--z-paper-2)] shadow-[6px_6px_0_var(--z-ink)]"
                    style={{ aspectRatio: '2 / 3', transform: `rotate(${i % 2 ? 1 : -1}deg)` }}
                  >
                    <BookImage src={p.images?.[0]} title={p.name} />
                  </div>
                  <p className="mt-4 line-clamp-2 text-[15px] font-bold leading-snug group-hover:underline group-hover:underline-offset-4">{p.name}</p>
                  <p className="z-display text-lg">{formatCurrency(p.price)}</p>
                </Link>
              ))}
            </div>
          ) : related.length > 0 ? (
            <ProductGrid products={related} />
          ) : null}
        </div>
      </section>

      {/* Barra de compra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t-[3px] border-[var(--z-ink)] bg-[var(--z-yellow)] px-4 py-3 md:hidden">
        <div className="flex flex-col leading-tight">
          {product.originalPrice && <span className="text-[10px] font-medium text-zinc-600 line-through">{formatCurrency(product.originalPrice)}</span>}
          <span className="z-display text-xl">{formatCurrency(product.price)}</span>
        </div>
        <button onClick={handleAddToCart} disabled={product.stock === 0} className="z-btn z-btn--ink flex-1 !py-3.5 !text-sm disabled:opacity-50">
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}
