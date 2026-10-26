'use client'

import { useEffect, useState } from 'react'
import { supabaseAdmin as supabase } from '@/lib/supabase'

type Desconto = {
  id: number
  code: string
  type: 'percentual' | 'fixo'
  value: number
  min_order: number
  usage_count: number
  usage_limit: number | null
  expires_at: string
  active: boolean
}

type FormState = {
  code: string
  type: 'percentual' | 'fixo'
  value: string
  min_order: string
  usage_limit: string
  expires_at: string
}

export default function Descontos() {
  const [descontos, setDescontos] = useState<Desconto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    code: '', type: 'percentual', value: '', min_order: '', usage_limit: '', expires_at: '',
  })

  async function load() {
    const { data } = await supabase.from('discounts').select('*').order('created_at', { ascending: false })
    setDescontos(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleAtivo(id: number, current: boolean) {
    await supabase.from('discounts').update({ active: !current }).eq('id', id)
    setDescontos((prev) => prev.map((d) => d.id === id ? { ...d, active: !current } : d))
  }

  async function handleRemove(id: number) {
    await supabase.from('discounts').delete().eq('id', id)
    setDescontos((prev) => prev.filter((d) => d.id !== id))
  }

  async function handleAdd() {
    if (!form.code || !form.value || !form.expires_at) return
    setSaving(true)
    const payload = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value),
      min_order: Number(form.min_order) || 0,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      expires_at: form.expires_at,
      active: true,
    }
    const { data, error } = await supabase.from('discounts').insert(payload).select().single()
    if (!error && data) {
      setDescontos((prev) => [data, ...prev])
      setForm({ code: '', type: 'percentual', value: '', min_order: '', usage_limit: '', expires_at: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black text-zinc-900 uppercase tracking-wide">Descontos</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? 'Carregando...' : `${descontos.filter((d) => d.active).length} cupons ativos`}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-zinc-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo cupom
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-zinc-200 rounded p-6 mb-6 max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 mb-4">Novo cupom de desconto</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Código</label>
              <input
                type="text"
                placeholder="ex: VERAO20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'percentual' | 'fixo' })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
              >
                <option value="percentual">Percentual (%)</option>
                <option value="fixo">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                Valor {form.type === 'percentual' ? '(%)' : '(R$)'}
              </label>
              <input
                type="number"
                placeholder={form.type === 'percentual' ? '10' : '50'}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Pedido mínimo (R$)</label>
              <input
                type="number"
                placeholder="0"
                value={form.min_order}
                onChange={(e) => setForm({ ...form, min_order: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Limite de usos (opcional)</label>
              <input
                type="number"
                placeholder="Ilimitado"
                value={form.usage_limit}
                onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Validade</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Criar cupom'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-zinc-500 px-4 py-2 rounded hover:text-zinc-900 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded">
        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-400">Carregando cupons...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Código</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Desconto</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Mín. pedido</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Usos</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Validade</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {descontos.map((d) => (
                <tr key={d.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors last:border-0">
                  <td className="px-5 py-3">
                    <span className="font-mono text-sm font-bold text-zinc-800 bg-zinc-100 px-2 py-1 rounded">{d.code}</span>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-zinc-800">
                    {d.type === 'percentual' ? `${d.value}% off` : `R$ ${d.value} off`}
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-500">
                    {d.min_order > 0 ? `R$ ${d.min_order}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-500">
                    {d.usage_count}{d.usage_limit ? ` / ${d.usage_limit}` : ''}
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-500">
                    {new Date(d.expires_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleAtivo(d.id, d.active)}
                      className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded transition-colors ${
                        d.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      {d.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleRemove(d.id)}
                      className="text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {descontos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-zinc-400">
                    Nenhum cupom cadastrado.
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
