'use client'

import { useEffect, useState } from 'react'
import PedidoDetalhe from './PedidoDetalhe'

type Order = {
  id: string
  customer_name: string
  customer_email: string
  product_name: string
  items: number
  total: number
  status: string
  created_at: string
  tracking_code?: string
  carrier?: string
}

const STATUS_COLOR: Record<string, string> = {
  Novo: 'bg-violet-50 text-violet-700',
  'A caminho': 'bg-blue-50 text-blue-700',
  Processando: 'bg-yellow-50 text-yellow-700',
  Entregue: 'bg-emerald-50 text-emerald-700',
  Cancelado: 'bg-red-50 text-red-700',
}

const STATUSES = ['Todos', 'Novo', 'Processando', 'A caminho', 'Entregue', 'Cancelado']

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function Pedidos() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [trackingEdit, setTrackingEdit] = useState<Record<string, string>>({})
  const [carrierEdit, setCarrierEdit] = useState<Record<string, string>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    setUpdatingId(null)
  }

  async function handleCarrierSave(id: string) {
    const carrier = carrierEdit[id]?.trim()
    if (carrier === undefined) return
    setUpdatingId(id)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, carrier }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, carrier } : o))
    setCarrierEdit(prev => { const n = { ...prev }; delete n[id]; return n })
    setUpdatingId(null)
  }

  async function handleTrackingSave(id: string) {
    const code = trackingEdit[id]?.trim()
    if (code === undefined) return
    setUpdatingId(id)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, tracking_code: code }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, tracking_code: code } : o))
    setTrackingEdit(prev => { const n = { ...prev }; delete n[id]; return n })
    setUpdatingId(null)
  }

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.product_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'Todos' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalReceita = filtered.reduce((s, o) => s + o.total, 0)

  if (selectedId) {
    return <PedidoDetalhe orderId={selectedId} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black text-zinc-900 uppercase tracking-wide">Pedidos</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? 'Carregando...' : `${filtered.length} pedidos encontrados`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar pedido, cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                statusFilter === s ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {!loading && (
          <div className="ml-auto text-sm font-semibold text-zinc-700">
            Total: <span className="text-zinc-900">{fmt(totalReceita)}</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded">
        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-400">Carregando pedidos...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Pedido</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Cliente</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Produto</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Itens</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Valor</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Transportadora</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Rastreio</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Data</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors last:border-0 cursor-pointer" onClick={() => setSelectedId(o.id)}>
                  <td className="px-5 py-3 text-sm font-mono font-semibold text-zinc-700">{o.id}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-zinc-800 font-medium">{o.customer_name}</p>
                    <p className="text-xs text-zinc-400">{o.customer_email}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-500 max-w-[200px] truncate">{o.product_name}</td>
                  <td className="px-5 py-3 text-sm text-zinc-500">{o.items}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-zinc-800">{fmt(o.total)}</td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    {o.status === 'Novo' ? (
                      <button
                        onClick={() => handleStatusChange(o.id, 'Processando')}
                        disabled={updatingId === o.id}
                        className="text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {updatingId === o.id ? 'Confirmando...' : 'Confirmar pedido?'}
                      </button>
                    ) : o.status === 'A caminho' ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded ${STATUS_COLOR['A caminho']}`}>A caminho</span>
                        <button
                          onClick={() => handleStatusChange(o.id, 'Entregue')}
                          disabled={updatingId === o.id}
                          className="text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {updatingId === o.id ? 'Salvando...' : 'Confirmar entrega'}
                        </button>
                      </div>
                    ) : o.status === 'Entregue' ? (
                      <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded ${STATUS_COLOR['Entregue']}`}>Entregue</span>
                    ) : (
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50 ${STATUS_COLOR[o.status] ?? 'bg-zinc-100 text-zinc-500'}`}
                      >
                        {['Processando', 'A caminho', 'Cancelado'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    {carrierEdit[o.id] !== undefined ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={carrierEdit[o.id]}
                          onChange={e => setCarrierEdit(prev => ({ ...prev, [o.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleCarrierSave(o.id)}
                          placeholder="Ex: Correios, Jadlog..."
                          className="border border-zinc-300 rounded px-2 py-1 text-xs w-36 focus:outline-none focus:border-zinc-600"
                        />
                        <button onClick={() => handleCarrierSave(o.id)} className="text-xs text-white bg-zinc-900 px-2 py-1 rounded hover:bg-zinc-700">OK</button>
                        <button onClick={() => setCarrierEdit(prev => { const n = { ...prev }; delete n[o.id]; return n })} className="text-xs text-zinc-400 hover:text-zinc-700">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCarrierEdit(prev => ({ ...prev, [o.id]: o.carrier ?? '' }))}
                        className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                      >
                        {o.carrier ? <span className="text-zinc-700">{o.carrier}</span> : <span className="text-zinc-300">+ Adicionar</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    {trackingEdit[o.id] !== undefined ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={trackingEdit[o.id]}
                          onChange={e => setTrackingEdit(prev => ({ ...prev, [o.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleTrackingSave(o.id)}
                          placeholder="Código de rastreio"
                          className="border border-zinc-300 rounded px-2 py-1 text-xs w-36 focus:outline-none focus:border-zinc-600"
                        />
                        <button onClick={() => handleTrackingSave(o.id)} className="text-xs text-white bg-zinc-900 px-2 py-1 rounded hover:bg-zinc-700">OK</button>
                        <button onClick={() => setTrackingEdit(prev => { const n = { ...prev }; delete n[o.id]; return n })} className="text-xs text-zinc-400 hover:text-zinc-700">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setTrackingEdit(prev => ({ ...prev, [o.id]: o.tracking_code ?? '' }))}
                        className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                      >
                        {o.tracking_code ? <span className="font-mono text-zinc-700">{o.tracking_code}</span> : <span className="text-zinc-300">+ Adicionar</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{fmtDate(o.created_at)}</td>
                  <td className="px-5 py-3 text-xs text-zinc-300">
                    {updatingId === o.id && 'Salvando...'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-zinc-400">
                    Nenhum pedido encontrado.
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
