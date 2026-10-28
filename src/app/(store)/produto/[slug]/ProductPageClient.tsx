'use client'

import { useState, use, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getMockCategoryLabel, getMockProductBySlug, mockProducts } from '@/lib/data/products'
import { Product } from '@/lib/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/context/AuthContext'
import { ProductGallery } from '@/components/product'
import BookCarousel from '@/components/home/BookCarousel'

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

// Avaliações de exemplo (fictícias) enquanto não há avaliações reais no cadastro
const MOCK_REVIEWS = [
  { name: 'Camila R.', rating: 5, date: 'há 2 semanas', text: 'Chegou muito bem embalado e a capa é ainda mais bonita pessoalmente. Li em dois dias, não consegui largar.' },
  { name: 'Rafael T.', rating: 5, date: 'há 1 mês', text: 'Ótima edição, papel agradável e letra confortável. Entrega bem antes do prazo.' },
  { name: 'Beatriz M.', rating: 4, date: 'há 1 mês', text: 'História envolvente e bem escrita. O final me pegou de surpresa. Recomendo para quem gosta de uma leitura sem pressa.' },
  { name: 'Lucas A.', rating: 5, date: 'há 2 meses', text: 'Comprei de presente e a pessoa amou. Atendimento rápido quando tive uma dúvida sobre o frete.' },
  { name: 'Marina S.', rating: 4, date: 'há 3 meses', text: 'Bom custo-benefício. Já é o terceiro livro que compro aqui e nunca tive problema.' },
]

// ── Sub-components ───────────────────────────────────────────
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
  return (
    <div className="flex" aria-label={`Nota ${rating} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`${dim} ${i + 1 <= Math.round(rating) ? 'text-accent' : 'text-border-strong'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function AccordionItem({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className="border-t border-border first:border-t-0">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between py-4 text-left">
        <span className="text-base font-semibold text-ink">{title}</span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border-strong text-lg leading-none text-ink transition-transform"
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

const label = 'mb-2.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted'

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
  const [openSection, setOpenSection] = useState<'sobre' | 'levar' | 'ficha' | null>('sobre')
  const toggleSection = (id: 'sobre' | 'levar' | 'ficha') => setOpenSection((cur) => (cur === id ? null : id))

  const addItem = useCartStore((s) => s.addItem)
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    let active = true

    async function loadMockProduct() {
      await Promise.resolve()
      const p = getMockProductBySlug(slug)
      if (!active) return
      if (!p) {
        setLoading(false)
        return
      }

      setProduct(p)
      const others = mockProducts.filter((item) => item.slug !== slug)
      const sameGenre = others.filter((item) => item.category === p.category)
      setRelated([...sameGenre, ...others.filter((item) => item.category !== p.category)].slice(0, 8))
      setLoading(false)
      setAiRecsLoading(true)

      try {
        const response = await fetch('/api/ai/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentProduct: p, allProducts: mockProducts }),
        })
        const data = await response.json()
        if (active) setAiRecs(data.products ?? [])
      } catch {
        // As recomendações são complementares; a página continua com os dados mock.
      } finally {
        if (active) setAiRecsLoading(false)
      }
    }

    void loadMockProduct()
    return () => { active = false }
  }, [slug])

  if (loading) return (
    <div data-tone="light" className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted">Folheando as estantes…</p>
    </div>
  )
  if (!product) return (
    <div data-tone="light" className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="surface px-10 py-8">
        <p className="text-3xl font-semibold text-ink">Página 404</p>
        <p className="mt-1 text-sm text-muted">Esse livro saiu da estante.</p>
      </div>
      <Link href="/produtos" className="btn-primary">Ver todos os livros</Link>
    </div>
  )

  const wishlisted = isWishlisted(product.id)
  const reviewStart = [...product.slug].reduce((n, c) => n + c.charCodeAt(0), 0) % 3

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
      router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      return
    }
    addItem(product, quantity, colors[selectedColor]?.name, selectedSize ?? undefined)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const ctaLabel = added ? '✓ Na sacola!' : product.stock === 0 ? 'Esgotado' : 'Colocar na sacola'

  return (
    <div data-tone="light" className="bg-bg pb-24 md:pb-0">
      {/* Trilha */}
      <div className="mx-auto max-w-[1200px] px-4 pt-6 md:px-8">
        <p className="text-sm text-muted">
          <Link href="/" className="hover:text-accent">Início</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href="/produtos" className="hover:text-accent">Livros</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-ink">{getMockCategoryLabel(product.category)}</span>
        </p>
      </div>

      {/* ── Capa + ficha ── */}
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:px-8 lg:gap-16 lg:py-12">
        <div className="md:sticky md:top-6 md:self-start">
          <ProductGallery images={product.images} alt={product.name} />
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            {product.featured && <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-on-accent">Queridinho</span>}
            {discount && <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-on-accent">-{discount}%</span>}
            {!product.featured && !discount && <span className="rounded-full border border-border-strong px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink">Novo</span>}
            {product.reviewCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <Stars rating={product.rating} /> {product.rating} · {product.reviewCount.toLocaleString('pt-BR')} leitores
              </span>
            )}
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{getMockCategoryLabel(product.category)}</p>
          <h1 className="mt-1.5 text-3xl text-ink md:text-4xl">{product.name}</h1>
          {product.author && <p className="mt-2 text-base text-muted">por {product.author}</p>}

          <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-border py-5">
            <span className="text-4xl font-semibold text-ink md:text-5xl">{formatCurrency(product.price)}</span>
            {product.originalPrice && <span className="text-base text-muted line-through">{formatCurrency(product.originalPrice)}</span>}
            {product.originalPrice && <span className="text-sm font-semibold text-accent">Você economiza {formatCurrency(product.originalPrice - product.price)}</span>}
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
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                    s === selectedSize ? 'border-accent bg-accent text-on-accent' : 'border-border-strong bg-card text-ink hover:border-accent'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Edição / capa (só se o cadastro tiver cores) */}
          {colors.length > 0 && (
            <div className="mt-6">
              <span className={label}>Edição: <span className="font-medium normal-case tracking-normal text-ink">{colors[selectedColor]?.name}</span></span>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    title={color.name}
                    aria-label={color.name}
                    aria-pressed={i === selectedColor}
                    className={`h-9 w-9 rounded-full border border-border-strong transition-transform hover:scale-110 ${i === selectedColor ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''}`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantidade */}
          <div className="mt-6">
            <span className={label}>Quantidade</span>
            <div className="inline-flex items-center rounded-full border border-border-strong bg-card">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Diminuir"
                className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-ink hover:bg-card-hover"
              >
                −
              </button>
              <span className="w-10 text-center font-semibold text-ink">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={product.stock === 0}
                aria-label="Aumentar"
                className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-ink hover:bg-card-hover disabled:opacity-30"
              >
                +
              </button>
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="ml-4 text-sm font-semibold text-accent">Só restam {product.stock}!</span>
            )}
          </div>

          {/* Comprar */}
          <div className="mt-8 hidden gap-3 md:flex md:flex-col">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary w-full !min-h-[56px] !text-base">
              {ctaLabel}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => toggleWishlist(product.id)}
                className="btn-outline flex-1"
                aria-pressed={wishlisted}
              >
                {wishlisted ? '♥ Salvo' : '♡ Salvar'}
              </button>
              {WHATSAPP && (
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Oi! Queria saber mais sobre o livro "${product.name}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline flex-1"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {product.stock > 0 && (
            <p className="mt-5 rounded-xl border border-border bg-card px-4 py-3 text-center text-sm text-ink">
              Livro em estoque com <strong className="text-accent">envio imediato</strong>
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
                className="flex-1 rounded-full border border-border-strong bg-card px-5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <button onClick={handleCalculateShipping} disabled={calculatingShipping} className="btn-outline !min-h-[44px] !px-6 !py-2 !text-sm disabled:opacity-50">
                {calculatingShipping ? '…' : 'OK'}
              </button>
            </div>
            {shippingResult && (
              <div className="surface mt-3 divide-y divide-border">
                {shippingResult.map((opt) => (
                  <div key={opt.label} className="flex items-center justify-between px-4 py-3 text-sm text-ink">
                    <span><strong>{opt.label}</strong> <span className="text-muted">· {opt.days}</span></span>
                    <strong>{opt.price}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="surface mt-10 px-5">
            <AccordionItem title="Sobre o livro" open={openSection === 'sobre'} onToggle={() => toggleSection('sobre')}>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{product.description || 'Em breve, mais detalhes sobre este livro.'}</p>
            </AccordionItem>
            <AccordionItem title="Por que levar" open={openSection === 'levar'} onToggle={() => toggleSection('levar')}>
              <ul className="space-y-2.5">
                {productFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[15px] text-ink">
                    <svg className="mt-1 h-4 w-4 flex-shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </AccordionItem>
            <AccordionItem title="Ficha técnica" open={openSection === 'ficha'} onToggle={() => toggleSection('ficha')}>
              <dl className="divide-y divide-border text-sm">
                {[
                  ['Gênero', getMockCategoryLabel(product.category)],
                  ['Nota', product.reviewCount > 0 ? `${product.rating} / 5` : 'ainda sem avaliações'],
                  ['Estoque', product.stock > 0 ? `${product.stock} unidades` : 'esgotado'],
                  ['Referência', `REF-${product.id.padStart(5, '0')}`],
                ].map(([l, v]) => (
                  <div key={l} className="flex py-2.5">
                    <dt className="w-28 flex-shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{l}</dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              {product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <span key={t} className="rounded-full border border-border-strong px-3 py-1 text-xs text-muted">#{t}</span>
                  ))}
                </div>
              )}
            </AccordionItem>
          </div>
        </div>
      </div>

      {/* ── Nota dos leitores ── */}
      {product.reviewCount > 0 && (
        <div data-tone="dark">
          <section className="px-4 py-14 md:px-12 lg:px-20">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="flex items-center gap-6">
                <p className="text-7xl font-semibold leading-none text-ink">{product.rating}</p>
                <div>
                  <Stars rating={product.rating} size="lg" />
                  <p className="mt-2 text-sm text-muted">de {product.reviewCount.toLocaleString('pt-BR')} leitores</p>
                </div>
              </div>
              <p className="max-w-sm text-xl text-ink sm:text-right">Quem leu, recomenda.</p>
            </div>

            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {MOCK_REVIEWS.slice(reviewStart, reviewStart + 3).map((r) => (
                <li key={r.name} className="surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Stars rating={r.rating} />
                    <span className="text-xs text-muted">{r.date}</span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink">{r.text}</p>
                  <p className="mt-4 text-sm font-semibold text-ink">{r.name} <span className="font-normal text-muted">· compra verificada</span></p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {/* ── Próxima leitura (IA) ── */}
      <div className="overflow-x-clip">
        <section className="container-page py-12 md:py-16">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Quem levou esse, olhou também</p>
            <h2 className="mt-1.5 text-3xl text-ink md:text-4xl">Próxima leitura</h2>
          </div>

          {aiRecsLoading ? (
            <div className="flex gap-5 overflow-hidden">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-[72%] shrink-0 animate-pulse sm:w-[300px]">
                  <div className="aspect-[2/3] w-full rounded-sm bg-card-hover" />
                  <div className="mt-3 h-3 w-3/4 rounded bg-card-hover" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-card-hover" />
                </div>
              ))}
            </div>
          ) : aiRecs.length > 0 ? (
            <BookCarousel books={aiRecs} label="Próxima leitura" />
          ) : related.length > 0 ? (
            <BookCarousel books={related} label="Outros livros" />
          ) : null}
        </section>
      </div>

      {/* Barra de compra fixa no celular */}
      <div data-tone="dark" className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-bg px-4 py-3 md:hidden">
        <div className="flex flex-col leading-tight">
          {product.originalPrice && <span className="text-[10px] text-muted line-through">{formatCurrency(product.originalPrice)}</span>}
          <span className="text-xl font-semibold text-ink">{formatCurrency(product.price)}</span>
        </div>
        <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary flex-1 disabled:opacity-50">
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}
