'use client'

import { useState, useRef, useEffect } from 'react'
import { supabaseAdmin as supabase } from '@/lib/supabase'

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
}

interface Props {
  product?: Product
  onSaved: () => void
  onCancel: () => void
}

interface CategoryType {
  value: string
  label: string
  defaultSizes: string
  hasSizes: boolean
}

function CategoryDropdown({ categories, value, onChange }: {
  categories: CategoryType[]
  value: string
  onChange: (v: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selected = categories.find((c) => c.value === value)

  const filtered = query.trim()
    ? categories.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : categories

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(cat: CategoryType) {
    onChange(cat.value)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border border-zinc-300 focus-within:border-zinc-900 transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={open ? query : (selected?.label ?? '')}
          placeholder={categories.length === 0 ? 'Carregando...' : 'Digite para buscar categoria...'}
          onFocus={() => { setOpen(true); setQuery('') }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          className="flex-1 px-3 py-2 text-sm bg-white focus:outline-none"
        />
        <svg className={`h-4 w-4 text-zinc-400 mr-3 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-zinc-200 shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-zinc-400">Nenhuma categoria encontrada.</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(c)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  c.value === value ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                {c.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

const DEFAULT_COLORS: ProductColor[] = [
  { name: 'PRETO', hex: '#111111' },
  { name: 'CINZA', hex: '#9ca3af' },
  { name: 'BRANCO', hex: '#f8f8f8' },
]

export default function ProductForm({ product, onSaved, onCancel }: Props) {
  const isEdit = !!product
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    original_price: product?.original_price?.toString() ?? '',
    category: product?.category ?? 'roupas',
    stock: product?.stock?.toString() ?? '0',
    rating: product?.rating?.toString() ?? '5.0',
    review_count: product?.review_count?.toString() ?? '0',
    featured: product?.featured ?? false,
    tags: product?.tags?.join(', ') ?? '',
    sizes: product?.sizes?.join(', ') ?? 'P, M, G, GG, XGG',
    features: product?.features?.join('\n') ?? '',
    meta_title: (product as { meta_title?: string })?.meta_title ?? '',
    meta_description: (product as { meta_description?: string })?.meta_description ?? '',
  })

  const [sections, setSections] = useState<string[]>(
    (product as { section?: string[] })?.section ?? []
  )

  const [aiDescLoading, setAiDescLoading] = useState(false)
  const [aiDescMsg, setAiDescMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  const [aiSeoLoading, setAiSeoLoading] = useState(false)
  const [aiSeoMsg, setAiSeoMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [showSeoTooltip, setShowSeoTooltip] = useState(false)

  async function handleGenerateSeo() {
    if (!form.name.trim() || !form.description.trim()) {
      setShowSeoTooltip(true)
      setTimeout(() => setShowSeoTooltip(false), 2500)
      return
    }
    setAiSeoLoading(true)
    setAiSeoMsg(null)
    try {
      const tags = form.tags.split(',').map((s) => s.trim()).filter(Boolean)
      const res = await fetch('/api/ai/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: form.name, categoria: form.category, descricao: form.description, tags }),
      })
      const data = await res.json()
      if (!res.ok || !data.metaTitle) throw new Error()
      setForm((f) => ({ ...f, meta_title: data.metaTitle, meta_description: data.metaDescription }))
      setAiSeoMsg({ text: 'SEO gerado com sucesso', type: 'success' })
    } catch {
      setAiSeoMsg({ text: 'Erro ao gerar. Tente novamente.', type: 'error' })
    } finally {
      setAiSeoLoading(false)
      setTimeout(() => setAiSeoMsg(null), 3000)
    }
  }

  async function handleGenerateDescription() {
    if (!form.description.trim()) {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 2500)
      return
    }
    setAiDescLoading(true)
    setAiDescMsg(null)
    try {
      const diferenciais = form.features.split('\n').map((s) => s.trim()).filter(Boolean)
      const tags = form.tags.split(',').map((s) => s.trim()).filter(Boolean)
      const cores = colors.map((c) => c.name)
      const res = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: form.name, categoria: form.category, descricaoBreve: form.description, diferenciais, tags, cores }),
      })
      const data = await res.json()
      if (!res.ok || !data.description) throw new Error()
      set('description', data.description)
      setAiDescMsg({ text: 'Descrição gerada com sucesso', type: 'success' })
    } catch {
      setAiDescMsg({ text: 'Erro ao gerar. Tente novamente.', type: 'error' })
    } finally {
      setAiDescLoading(false)
      setTimeout(() => setAiDescMsg(null), 3000)
    }
  }

  const [categories, setCategories] = useState<CategoryType[]>([])

  useEffect(() => {
    supabase.from('categories').select('slug, name, has_sizes, default_sizes').eq('active', true).order('name').then(({ data }) => {
      if (data) setCategories(data.map((c) => ({
        value: c.slug,
        label: c.name,
        hasSizes: c.has_sizes,
        defaultSizes: c.default_sizes,
      })))
    })
  }, [])

  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadError('')

    for (const file of Array.from(files)) {
      // Mostra preview local imediatamente
      const localUrl = URL.createObjectURL(file)
      setImages((prev) => [...prev, localUrl])

      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)

      if (error) {
        // Remove o preview local se o upload falhou
        setImages((prev) => prev.filter((u) => u !== localUrl))
        setUploadError(`Erro no upload: ${error.message}`)
      } else {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        // Substitui o URL local pelo URL final do Supabase
        setImages((prev) => prev.map((u) => u === localUrl ? data.publicUrl : u))
      }
    }

    setUploading(false)
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i))
  }

  const [colors, setColors] = useState<ProductColor[]>(
    product?.colors?.length ? product.colors : DEFAULT_COLORS
  )
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#000000')

  function addColor() {
    const name = newColorName.trim().toUpperCase()
    if (!name) return
    setColors((prev) => [...prev, { name, hex: newColorHex }])
    setNewColorName('')
    setNewColorHex('#000000')
  }

  function removeColor(i: number) {
    setColors((prev) => prev.filter((_, idx) => idx !== i))
  }

  function set(field: string, value: string | boolean) {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      if (field === 'name' && !isEdit) updated.slug = slugify(value as string)
      if (field === 'category') {
        const type = categories.find((t) => t.value === value)
        if (type) updated.sizes = type.defaultSizes
      }
      return updated
    })
  }

  const currentType = categories.find((t) => t.value === form.category) ?? categories[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const tags = form.tags.split(',').map((s) => s.trim()).filter(Boolean)
    const sizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean)
    const features = form.features.split('\n').map((s) => s.trim()).filter(Boolean)

    const payload = {
      id: product?.id ?? generateId(),
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category: form.category,
      section: sections.length > 0 ? sections : null,
      stock: parseInt(form.stock),
      rating: parseFloat(form.rating),
      review_count: parseInt(form.review_count),
      featured: form.featured,
      images,
      tags,
      colors,
      sizes,
      features,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
    }

    const { error: err } = await supabase.from('products').upsert(payload)
    setSaving(false)

    if (err) {
      setError(err.message)
    } else {
      onSaved()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">
            {isEdit ? 'Editar produto' : 'Novo produto'}
          </h1>
          <p className="text-xs text-zinc-400">{isEdit ? product.name : 'Preencha os dados abaixo'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
            ← Voltar
          </button>
          <button type="submit" form="product-form" disabled={saving}
            className="px-6 py-2 bg-zinc-900 text-white text-xs font-black uppercase tracking-[0.18em] hover:bg-zinc-700 transition-colors disabled:opacity-50">
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar produto'}
          </button>
        </div>
      </header>

      <form id="product-form" onSubmit={handleSubmit} className="px-10 py-8 max-w-screen-2xl mx-auto">
        <div className="space-y-6">

          {/* Nome + Slug + Descrição + Diferenciais */}
          <div className="bg-white border border-zinc-200 p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Nome *</label>
                <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                  className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Slug *</label>
                <input required value={form.slug} onChange={(e) => set('slug', e.target.value)}
                  className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Descrição</label>
                <div className="relative flex items-center gap-2">
                  {aiDescMsg && (
                    <span className={`text-[10px] font-medium ${aiDescMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {aiDescMsg.text}
                    </span>
                  )}
                  <div className="relative">
                    {showTooltip && (
                      <div className="absolute bottom-full right-0 mb-1.5 whitespace-nowrap bg-zinc-800 text-white text-[10px] px-2.5 py-1.5 rounded shadow-md">
                        Escreva uma descrição breve primeiro
                        <span className="absolute top-full right-3 border-4 border-transparent border-t-zinc-800" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={aiDescLoading}
                      className="flex items-center gap-1.5 border border-zinc-300 px-2.5 py-1 text-[10px] font-semibold text-zinc-600 hover:border-zinc-600 hover:text-zinc-900 transition-colors disabled:opacity-60 whitespace-nowrap"
                    >
                      {aiDescLoading ? (
                        <>
                          <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          Gerando...
                        </>
                      ) : (
                        <>✦ Gerar com IA</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)}
                placeholder="Escreva uma descrição breve para a IA expandir..."
                className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 resize-none" />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">
                Diferenciais <span className="normal-case font-normal">(um por linha)</span>
              </label>
              <textarea rows={4} value={form.features} onChange={(e) => set('features', e.target.value)}
                placeholder={'Anti odor e anti suor\nNão amassa e não desbota\nSecagem rápida'}
                className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 resize-none" />
            </div>
          </div>

          {/* Tipo de produto + Seção */}
          <div className="bg-white border border-zinc-200 p-8 space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-2">Tipo de produto *</label>
              <CategoryDropdown
                categories={categories}
                value={form.category}
                onChange={(v) => set('category', v)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-3">Seções do site</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'masculino', label: 'Ficção' },
                  { value: 'feminino', label: 'Não-ficção' },
                  { value: 'inverno', label: 'Clássicos' },
                  { value: 'tecnologia', label: 'Tecnologia & Ciência' },
                  { value: 'acessorios', label: 'Papelaria & Brindes' },
                  { value: 'novidades', label: 'Novidades' },
                ].map((s) => (
                  <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sections.includes(s.value)}
                      onChange={(e) => setSections(prev =>
                        e.target.checked ? [...prev, s.value] : prev.filter(v => v !== s.value)
                      )}
                      className="accent-zinc-900 w-4 h-4"
                    />
                    <span className="text-sm text-zinc-700">{s.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-2">Um produto pode aparecer em várias seções.</p>
            </div>
          </div>

          {/* Preços */}
          <div className="bg-white border border-zinc-200 p-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Preço (R$) *</label>
                <input required type="number" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)}
                  className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">
                  Preço original (R$) <span className="normal-case font-normal">— aparece riscado</span>
                </label>
                <input type="number" step="0.01" value={form.original_price} onChange={(e) => set('original_price', e.target.value)}
                  className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
              </div>
            </div>
          </div>

          {/* Estoque + Rating + Reviews + Destaque */}
          <div className="bg-white border border-zinc-200 p-8">
            <div className="grid grid-cols-3 gap-6 mb-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Estoque</label>
                <input type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)}
                  className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Rating (0-5)</label>
                <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set('rating', e.target.value)}
                  className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Nº de reviews</label>
                <input type="number" value={form.review_count} onChange={(e) => set('review_count', e.target.value)}
                  className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="h-4 w-4 accent-zinc-900" />
              <label htmlFor="featured" className="text-sm text-zinc-700">Produto em destaque (Best Seller)</label>
            </div>
          </div>

          {/* Tags + Tamanhos + Cores */}
          <div className="bg-white border border-zinc-200 p-8 space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">
                Tags <span className="normal-case font-normal">(separadas por vírgula)</span>
              </label>
              <input value={form.tags} onChange={(e) => set('tags', e.target.value)}
                placeholder="camiseta, algodao, casual"
                className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
            </div>

            {currentType?.hasSizes && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">
                  Tamanhos <span className="normal-case font-normal">(separados por vírgula)</span>
                </label>
                <input value={form.sizes} onChange={(e) => set('sizes', e.target.value)}
                  placeholder={currentType?.defaultSizes ?? ''}
                  className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
                <p className="text-[10px] text-zinc-400 mt-1">
                  {form.category === 'calcados' ? 'Ex: 37, 38, 39, 40, 41, 42' : 'Ex: P, M, G, GG, XGG'}
                </p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-2">Cores</label>
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 border border-zinc-200 rounded-full pl-1 pr-2 py-1 bg-white">
                      <span className="h-5 w-5 rounded-full border border-zinc-200 flex-shrink-0" style={{ backgroundColor: c.hex }} />
                      <span className="text-xs text-zinc-700 font-medium">{c.name}</span>
                      <button type="button" onClick={() => removeColor(i)} className="ml-0.5 text-zinc-300 hover:text-red-400 transition-colors leading-none">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-9 w-10 border border-zinc-300 rounded cursor-pointer p-0.5" />
                <input type="text" placeholder="Nome da cor (ex: Preto)" value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  className="flex-1 border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" />
                <button type="button" onClick={addColor}
                  className="px-4 py-2 border border-zinc-300 text-xs font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors whitespace-nowrap">
                  + Adicionar
                </button>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white border border-zinc-200 p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">SEO</h2>
              <div className="relative flex items-center gap-2">
                {aiSeoMsg && (
                  <span className={`text-[10px] font-medium ${aiSeoMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {aiSeoMsg.text}
                  </span>
                )}
                <div className="relative">
                  {showSeoTooltip && (
                    <div className="absolute bottom-full right-0 mb-1.5 whitespace-nowrap bg-zinc-800 text-white text-[10px] px-2.5 py-1.5 rounded shadow-md">
                      Preencha o nome e a descrição primeiro
                      <span className="absolute top-full right-3 border-4 border-transparent border-t-zinc-800" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateSeo}
                    disabled={aiSeoLoading}
                    className="flex items-center gap-1.5 border border-zinc-300 px-2.5 py-1 text-[10px] font-semibold text-zinc-600 hover:border-zinc-600 hover:text-zinc-900 transition-colors disabled:opacity-60 whitespace-nowrap"
                  >
                    {aiSeoLoading ? (
                      <>
                        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Gerando...
                      </>
                    ) : <>✦ Gerar SEO com IA</>}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Meta Title</label>
                <span className={`text-[10px] font-medium ${form.meta_title.length > 60 ? 'text-red-500' : 'text-zinc-400'}`}>
                  {form.meta_title.length}/60 caracteres
                </span>
              </div>
              <input
                type="text"
                value={form.meta_title}
                onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
                placeholder="Ex: O Nome do Livro | Papelada"
                className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Meta Description</label>
                <span className={`text-[10px] font-medium ${form.meta_description.length > 160 ? 'text-red-500' : 'text-zinc-400'}`}>
                  {form.meta_description.length}/160 caracteres
                </span>
              </div>
              <textarea
                rows={3}
                value={form.meta_description}
                onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
                placeholder="Ex: Um romance leve para ler numa tarde. Compre agora na Papelada com frete grátis acima de R$ 399."
                className="w-full border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 resize-none"
              />
            </div>
          </div>

          {/* Imagens */}
          <div className="bg-white border border-zinc-200 p-8">
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-3">
              Imagens <span className="normal-case font-normal">({images.length} foto{images.length !== 1 ? 's' : ''})</span>
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-8 gap-2 mb-3">
                {images.map((url, i) => (
                  <div key={i} className="relative group aspect-square bg-zinc-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 h-5 w-5 bg-black/60 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-zinc-900 text-white px-1.5 py-0.5 rounded">CAPA</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => handleImageUpload(e.target.files)} />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="w-full border-2 border-dashed border-zinc-300 py-10 flex flex-col items-center gap-2 text-zinc-400 hover:border-zinc-500 hover:text-zinc-600 transition-colors disabled:opacity-50">
              {uploading ? (
                <>
                  <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span className="text-xs font-semibold">Enviando...</span>
                </>
              ) : (
                <>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-xs font-semibold">Clique para enviar fotos</span>
                  <span className="text-[10px]">JPG, PNG, WEBP · múltiplas permitidas</span>
                </>
              )}
            </button>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center gap-3 pb-4">
            <button type="submit" disabled={saving}
              className="px-8 py-3 bg-zinc-900 text-white text-xs font-black uppercase tracking-[0.18em] hover:bg-zinc-700 transition-colors disabled:opacity-50">
              {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar produto'}
            </button>
            <button type="button" onClick={onCancel}
              className="px-6 py-3 border border-zinc-300 text-xs font-bold uppercase tracking-[0.15em] text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
