'use client'

import { useEffect, useState } from 'react'
import { supabaseAdmin as supabase } from '@/lib/supabase'

type Customer = {
  id: string
  name: string
  email: string
  phone: string | null
  total_orders: number
  total_spent: number
  last_order_at: string | null
  created_at: string
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function Clientes() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('customers')
      .select('*')
      .order('last_order_at', { ascending: false })
      .then(({ data }) => {
        setCustomers(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPedidos = customers.reduce((s, c) => s + c.total_orders, 0)
  const totalReceita = customers.reduce((s, c) => s + c.total_spent, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black text-zinc-900 uppercase tracking-wide">Clientes</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? 'Carregando...' : `${customers.length} clientes cadastrados`}
          </p>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-zinc-200 rounded p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">Total de clientes</p>
            <p className="text-3xl font-black text-zinc-900">{customers.length}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">Pedidos totais</p>
            <p className="text-3xl font-black text-zinc-900">{totalPedidos}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">Receita total</p>
            <p className="text-3xl font-black text-zinc-900">{fmt(totalReceita)}</p>
          </div>
        </div>
      )}

      <div className="relative max-w-xs mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      <div className="bg-white border border-zinc-200 rounded">
        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-400">Carregando clientes...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Cliente</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Telefone</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Pedidos</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Total gasto</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Último pedido</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 flex-shrink-0">
                        {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-800">{c.name}</p>
                        <p className="text-xs text-zinc-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-500">{c.phone ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-zinc-700 font-semibold">{c.total_orders}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-zinc-800">{fmt(c.total_spent)}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{fmtDate(c.last_order_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-zinc-400">
                    Nenhum cliente encontrado.
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
