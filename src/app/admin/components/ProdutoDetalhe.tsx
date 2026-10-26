'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductColor {
  name: string
  hex: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  images: string[]
  category: string
  stock: number
  rating: number
  review_count: number
  description: string
  tags: string[]
  featured: boolean
  colors: ProductColor[]
  sizes: string[]
  features: string[]
  created_at: string
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

export default function ProdutoDetalhe({
  product,
  onBack,
  onEdit,
  onDelete,
}: {
  product: Product
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [activeImg, setActiveImg] = useState(0)
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <div className="min-h-full p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Produtos
            </button>
            <span className="text-zinc-200">/</span>
            <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-wide line-clamp-1">{product.name}</h1>
            <span className="text-xs font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded bg-zinc-100 text-zinc-600 whitespace-nowrap">
              {product.category}
            </span>
            {product.featured && (
              <span className="text-xs font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                Destaque
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onEdit}
              className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-[0.1em] rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={onDelete}
              className="px-5 py-2.5 border border-red-200 text-red-400 text-xs font-bold uppercase tracking-[0.1em] rounded-lg hover:border-red-400 hover:text-red-600 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Esquerda: galeria + descrição */}
          <div className="col-span-2 space-y-6">

            {/* Galeria */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              {/* Imagem principal */}
              <div className="relative w-full aspect-[4/3] bg-zinc-50">
                {product.images[activeImg] ? (
                  <Image
                    src={product.images[activeImg]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 p-4 border-t border-zinc-100 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === activeImg ? 'border-zinc-900' : 'border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Descrição */}
            {product.description && (
              <div className="bg-white border border-zinc-200 rounded-xl">
                <div className="px-6 py-4 border-b border-zinc-100">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Descrição</p>
                </div>
                <div className="p-6">
                  <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>
                </div>
              </div>
            )}

            {/* Diferenciais */}
            {product.features && product.features.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl">
                <div className="px-6 py-4 border-b border-zinc-100">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Diferenciais</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700">
                        <svg className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Direita: info + ações */}
          <div className="space-y-6">

            {/* Preço e estoque */}
            <div className="bg-white border border-zinc-200 rounded-xl">
              <div className="px-6 py-4 border-b border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Preço</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-black text-zinc-900">{fmt(product.price)}</span>
                  {discount && (
                    <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded mb-0.5">-{discount}%</span>
                  )}
                </div>
                {product.original_price && (
                  <p className="text-sm text-zinc-400 line-through">{fmt(product.original_price)}</p>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                  <span className="text-sm text-zinc-400">Estoque</span>
                  <span className={`text-sm font-bold ${
                    product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-yellow-600' : 'text-zinc-900'
                  }`}>
                    {product.stock} unid.
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Avaliação</span>
                  <span className="text-sm font-bold text-zinc-900">
                    ★ {product.rating} <span className="font-normal text-zinc-400">({product.review_count})</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Cadastrado em</span>
                  <span className="text-xs text-zinc-500">{fmtDate(product.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Cores */}
            {product.colors && product.colors.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl">
                <div className="px-6 py-4 border-b border-zinc-100">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Cores</p>
                </div>
                <div className="p-6 flex flex-wrap gap-3">
                  {product.colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border border-zinc-200 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-xs text-zinc-600 font-medium">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tamanhos */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl">
                <div className="px-6 py-4 border-b border-zinc-100">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Tamanhos</p>
                </div>
                <div className="p-6 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <span key={s} className="px-3 py-1.5 border border-zinc-200 text-xs font-bold text-zinc-700 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl">
                <div className="px-6 py-4 border-b border-zinc-100">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Tags</p>
                </div>
                <div className="p-6 flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <span key={t} className="px-3 py-1 bg-zinc-100 text-xs text-zinc-600 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Slug */}
            <div className="bg-white border border-zinc-200 rounded-xl">
              <div className="px-6 py-4 border-b border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">URL</p>
              </div>
              <div className="p-6 flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-zinc-500 truncate">/produto/{product.slug}</span>
                <a
                  href={`/produto/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-xs text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
