'use client'

import { useEffect, useState } from 'react'
import { supabaseAdmin as supabase } from '@/lib/supabase'

type Categoria = {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  active: boolean
  created_at: string
}

type FormState = {
  name: string
  slug: string
  description: string
  image_url: string
  active: boolean
}

const EMPTY_FORM: FormState = { name: '', slug: '', description: '', image_url: '', active: true }

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategorias(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function openEdit(c: Categoria) {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', image_url: c.image_url ?? '', active: c.active })
    setError('')
    setShowForm(true)
  }

  function setField(field: keyof FormState, value: string | boolean) {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      if (field === 'name' && !editing) updated.slug = slugify(value as string)
      return updated
    })
  }

  async function handleSave() {
    if (!form.name || !form.slug) { setError('Nome e slug são obrigatórios.'); return }
    setSaving(true)
    setError('')

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      active: form.active,
    }

    let err
    if (editing) {
      ;({ error: err } = await supabase.from('categories').update(payload).eq('id', editing.id))
    } else {
      ;({ error: err } = await supabase.from('categories').insert(payload))
    }

    setSaving(false)
    if (err) { setError(err.message); return }
    await load()
    setShowForm(false)
  }

  async function toggleAtivo(id: number, current: boolean) {
    await supabase.from('categories').update({ active: !current }).eq('id', id)
    setCategorias((prev) => prev.map((c) => c.id === id ? { ...c, active: !current } : c))
  }

  async function handleRemove(id: number) {
    await supabase.from('categories').delete().eq('id', id)
    setCategorias((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black text-zinc-900 uppercase tracking-wide">Categorias</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? 'Carregando...' : `${categorias.filter((c) => c.active).length} categorias ativas`}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-zinc-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-zinc-200 rounded p-6 mb-6 max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 mb-4">
            {editing ? `Editar: ${editing.name}` : 'Nova categoria'}
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setField('slug', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Descrição</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">URL da imagem</label>
              <input
                type="text"
                placeholder="https://..."
                value={form.image_url}
                onChange={(e) => setField('image_url', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cat-active"
                checked={form.active}
                onChange={(e) => setField('active', e.target.checked)}
                className="h-4 w-4 accent-zinc-900"
              />
              <label htmlFor="cat-active" className="text-sm text-zinc-700">Categoria ativa</label>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar categoria'}
              </button>
              <button onClick={() => setShowForm(false)} className="text-sm text-zinc-500 px-4 py-2 rounded hover:text-zinc-900 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded">
        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-400">Carregando categorias...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Nome</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Slug</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Descrição</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {c.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image_url} alt="" className="h-8 w-8 rounded object-cover flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-zinc-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm font-mono text-zinc-500">{c.slug}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400 max-w-[240px] truncate">{c.description ?? '—'}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleAtivo(c.id, c.active)}
                      className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded transition-colors ${
                        c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      {c.active ? 'Ativa' : 'Inativa'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => openEdit(c)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button onClick={() => handleRemove(c.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-zinc-400">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
