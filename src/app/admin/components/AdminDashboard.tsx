'use client'

import { useState, useEffect } from 'react'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import ProductForm from './ProductForm'
import ProdutoDetalhe from './ProdutoDetalhe'

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

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [viewing, setViewing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')

  async function loadProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Excluir este produto?')) return
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  function handleSaved() {
    setEditing(null)
    setCreating(false)
    setViewing(null)
    loadProducts()
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  if (creating || editing) {
    return (
      <ProductForm
        product={editing ?? undefined}
        onSaved={handleSaved}
        onCancel={() => { setEditing(null); setCreating(false) }}
      />
    )
  }

  if (viewing) {
    return (
      <ProdutoDetalhe
        product={viewing}
        onBack={() => setViewing(null)}
        onEdit={() => { setEditing(viewing); setViewing(null) }}
        onDelete={async () => {
          if (!confirm('Excluir este produto?')) return
          await supabase.from('products').delete().eq('id', viewing.id)
          setViewing(null)
          loadProducts()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Papelada Admin</h1>
          <p className="text-xs text-zinc-400">Gerenciar produtos</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-4">
            Ver loja
          </a>
          <button onClick={onLogout} className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
            Sair
          </button>
        </div>
      </header>

      <div className="px-8 py-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-zinc-300 px-4 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-900 w-64"
            />
            <span className="text-xs text-zinc-400">{filtered.length} produtos</span>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-[0.15em] hover:bg-zinc-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo produto
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Produto</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Categoria</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Preço</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Estoque</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Destaque</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-zinc-400">Carregando...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-zinc-400">Nenhum produto encontrado</td>
                </tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => setViewing(p)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover bg-zinc-100 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-zinc-800">{p.name}</p>
                        <p className="text-xs text-zinc-400">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-zinc-100 text-zinc-600 font-medium">{p.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-zinc-800">R$ {p.price.toFixed(2).replace('.', ',')}</p>
                    {p.original_price && (
                      <p className="text-xs text-zinc-400 line-through">R$ {p.original_price.toFixed(2).replace('.', ',')}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-yellow-600' : 'text-zinc-800'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.featured ? (
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 bg-emerald-50 px-2 py-1">Sim</span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setEditing(p)}
                        className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-1.5 border border-zinc-200 hover:border-zinc-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors px-3 py-1.5 border border-red-100 hover:border-red-300"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
