'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { supabaseAdmin as supabase } from '@/lib/supabase'

type Order = {
  id: string
  customer_name: string
  product_name: string
  total: number
  status: string
  created_at: string
}

type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  featured: boolean
}

const STATUS_COLOR: Record<string, string> = {
  Pago: 'bg-emerald-50 text-emerald-700',
  'A caminho': 'bg-blue-50 text-blue-700',
  Processando: 'bg-yellow-50 text-yellow-700',
  Cancelado: 'bg-red-50 text-red-700',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function KPICard({ label, value, sub, loading }: { label: string; value: string; sub: string; loading: boolean }) {
  return (
    <div className="bg-white border border-zinc-200 rounded p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">{label}</p>
      {loading
        ? <div className="h-9 w-32 bg-zinc-100 rounded animate-pulse" />
        : <p className="text-3xl font-black text-zinc-900">{value}</p>
      }
      <p className="text-xs text-zinc-400 mt-1">{sub}</p>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-zinc-200 shadow px-3 py-2 text-xs">
      <p className="font-bold text-zinc-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-zinc-500">
          {typeof p.value === 'number' && p.value > 100 ? fmt(p.value) : `${p.value} pedidos`}
        </p>
      ))}
    </div>
  )
}

type Insight = {
  icone: string
  tipo: string
  titulo: string
  descricao: string
}

const BADGE_COLOR: Record<string, string> = {
  ESTOQUE: 'bg-red-50 text-red-700',
  OPORTUNIDADE: 'bg-emerald-50 text-emerald-700',
  TENDÊNCIA: 'bg-blue-50 text-blue-700',
  TENDENCIA: 'bg-blue-50 text-blue-700',
}

function badgeColor(tipo: string) {
  return BADGE_COLOR[tipo.toUpperCase()] ?? 'bg-zinc-100 text-zinc-600'
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<Insight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState(false)
  const [insightsTime, setInsightsTime] = useState<Date | null>(null)

  async function loadInsights(pedidos: Order[], prods: Product[]) {
    setInsightsLoading(true)
    setInsightsError(false)
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidos, produtos: prods }),
      })
      const data = await res.json()
      if (!res.ok || !data.insights?.length) throw new Error()
      setInsights(data.insights)
      setInsightsTime(new Date())
    } catch {
      setInsightsError(true)
    } finally {
      setInsightsLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('id, customer_name, product_name, total, status, created_at').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, category, price, stock, featured'),
    ]).then(([ordersRes, productsRes]) => {
      if (ordersRes.error) console.error('[Admin] orders error:', ordersRes.error)
      if (productsRes.error) console.error('[Admin] products error:', productsRes.error)
      const parsedOrders = (ordersRes.data ?? []).map(o => ({ ...o, total: Number(o.total) }))
      setOrders(parsedOrders)
      setProducts(productsRes.data ?? [])
      setLoading(false)
      loadInsights(parsedOrders, productsRes.data ?? [])
    }).catch(err => console.error('[Admin] fetch error:', err))
  }, [])

  // Pedidos novos
  const newOrders = orders.filter(o => o.status === 'Novo')

  // KPIs
  const totalReceita = orders.reduce((s, o) => s + o.total, 0)
  const totalVendas = orders.length
  const ticketMedio = totalVendas > 0 ? totalReceita / totalVendas : 0
  const produtosAtivos = products.length
  const semEstoque = products.filter((p) => p.stock === 0).length

  // Receita diária — agrupa pedidos por dia
  const salesByDay = orders.reduce<Record<string, number>>((acc, o) => {
    const day = fmtDate(o.created_at)
    acc[day] = (acc[day] ?? 0) + o.total
    return acc
  }, {})
  const salesData = Object.entries(salesByDay)
    .map(([day, receita]) => ({ day, receita: Math.round(receita) }))
    .reverse()
    .slice(-18)

  // Receita por categoria — baseada nos produtos × preço × vendas estimadas por categoria
  const categoryMap = orders.reduce<Record<string, number>>((acc, order) => {
    const product = products.find((p) =>
      order.product_name.toLowerCase().includes(p.category.toLowerCase()) ||
      p.category.toLowerCase().includes(order.product_name.split(' ')[0].toLowerCase())
    )
    const cat = product?.category ?? 'Outros'
    acc[cat] = (acc[cat] ?? 0) + order.total
    return acc
  }, {})

  // Fallback: se não associou nada, agrupa por category dos produtos com preço × stock
  const categoryData = Object.keys(categoryMap).length > 0
    ? Object.entries(categoryMap).map(([categoria, receita]) => ({ categoria, receita: Math.round(receita) }))
    : Object.entries(
        products.reduce<Record<string, number>>((acc, p) => {
          acc[p.category] = (acc[p.category] ?? 0) + p.price * Math.max(p.stock, 1)
          return acc
        }, {})
      ).map(([categoria, receita]) => ({ categoria, receita: Math.round(receita) }))

  const recentOrders = orders.slice(0, 5)

  // Período exibido no header
  const dates = orders.map((o) => new Date(o.created_at))
  const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null
  const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null
  const periodoLabel = minDate && maxDate
    ? `${minDate.toLocaleDateString('pt-BR')} — ${maxDate.toLocaleDateString('pt-BR')}`
    : '—'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black text-zinc-900 uppercase tracking-wide">Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? 'Carregando...' : `${totalVendas} pedidos no período`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 border border-zinc-200 bg-white px-4 py-2 rounded">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
          </svg>
          {periodoLabel}
        </div>
      </div>

      {/* Notificação de pedidos novos */}
      {!loading && newOrders.length > 0 && (
        <div className="mb-6 flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-lg px-5 py-4">
          <span className="flex-shrink-0 mt-0.5 h-2 w-2 rounded-full bg-violet-500 animate-pulse mt-1.5" />
          <div>
            <p className="text-sm font-bold text-violet-800">
              {newOrders.length} {newOrders.length === 1 ? 'novo pedido aguardando' : 'novos pedidos aguardando'} confirmação
            </p>
            <p className="text-xs text-violet-600 mt-0.5">
              {newOrders.map(o => o.id).join(', ')} — acesse <strong>Pedidos</strong> para confirmar.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard label="Receita total" value={fmt(totalReceita)} sub="todos os pedidos" loading={loading} />
        <KPICard label="Pedidos" value={String(totalVendas)} sub="no período" loading={loading} />
        <KPICard label="Ticket médio" value={fmt(ticketMedio)} sub="por pedido" loading={loading} />
        <KPICard label="Produtos ativos" value={String(produtosAtivos)} sub={`${semEstoque} sem estoque`} loading={loading} />
      </div>

      {/* Insights de IA */}
      <div className="bg-white border border-zinc-200 rounded mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="text-base">✦</span>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Insights de IA</p>
          </div>
          <button
            onClick={() => loadInsights(orders, products)}
            disabled={insightsLoading}
            className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <span className={insightsLoading ? 'inline-block animate-spin' : ''}>↺</span> Atualizar
          </button>
        </div>

        <div className="p-5">
          {insightsError ? (
            <p className="text-sm text-zinc-400 text-center py-6">Não foi possível carregar os insights agora.</p>
          ) : insightsLoading || !insights.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="border border-zinc-100 rounded p-4 animate-pulse space-y-3">
                  <div className="h-8 w-8 bg-zinc-100 rounded" />
                  <div className="h-3 w-20 bg-zinc-100 rounded" />
                  <div className="h-4 w-3/4 bg-zinc-100 rounded" />
                  <div className="h-3 w-full bg-zinc-100 rounded" />
                  <div className="h-3 w-5/6 bg-zinc-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {insights.map((ins, i) => (
                <div key={i} className="border border-zinc-100 rounded p-4 space-y-2 hover:border-zinc-300 transition-colors">
                  <span className="text-2xl">{ins.icone}</span>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded ${badgeColor(ins.tipo)}`}>
                      {ins.tipo}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 leading-tight">{ins.titulo}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{ins.descricao}</p>
                </div>
              ))}
            </div>
          )}

          {insightsTime && !insightsLoading && (
            <p className="text-[10px] text-zinc-300 mt-4">
              Atualizado agora · Powered by IA
            </p>
          )}
        </div>
      </div>

      {/* Charts */}
      {!loading && salesData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="col-span-2 bg-white border border-zinc-200 rounded p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 mb-4">Receita diária (R$)</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="receita" stroke="#18181b" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-zinc-200 rounded p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 mb-4">Receita por categoria</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="receita"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={['#18181b', '#52525b', '#a1a1aa', '#d4d4d8', '#e4e4e7'][i % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => typeof v === 'number' ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : v} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pedidos recentes */}
      <div className="bg-white border border-zinc-200 rounded">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Pedidos recentes</p>
        </div>
        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-400">Carregando pedidos...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-50">
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Pedido</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Cliente</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Produto</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Valor</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors last:border-0">
                  <td className="px-5 py-3 text-sm font-mono font-semibold text-zinc-700">{o.id}</td>
                  <td className="px-5 py-3 text-sm text-zinc-700">{o.customer_name}</td>
                  <td className="px-5 py-3 text-sm text-zinc-500 max-w-[180px] truncate">{o.product_name}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-zinc-800">{fmt(o.total)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded ${STATUS_COLOR[o.status] ?? 'bg-zinc-100 text-zinc-500'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{fmtDate(o.created_at)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-zinc-400">
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
