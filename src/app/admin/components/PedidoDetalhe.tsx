'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type OrderDetail = {
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
  product_image?: string | null
  product_slug?: string | null
}

const STATUS_STEPS = ['Novo', 'Processando', 'A caminho', 'Entregue']

const STATUS_COLOR: Record<string, string> = {
  Novo: 'bg-violet-50 text-violet-700 border-violet-200',
  'A caminho': 'bg-blue-50 text-blue-700 border-blue-200',
  Processando: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Entregue: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelado: 'bg-red-50 text-red-700 border-red-200',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function PedidoDetalhe({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [trackingVal, setTrackingVal] = useState('')
  const [carrierVal, setCarrierVal] = useState('')
  const [editTracking, setEditTracking] = useState(false)
  const [editCarrier, setEditCarrier] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/orders?id=${encodeURIComponent(orderId)}`)
      .then(r => r.json())
      .then(data => {
        setOrder(data)
        setTrackingVal(data.tracking_code ?? '')
        setCarrierVal(data.carrier ?? '')
        setLoading(false)
      })
  }, [orderId])

  async function patch(update: Record<string, string>) {
    setSaving(true)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, ...update }),
    })
    setOrder(prev => prev ? { ...prev, ...update } : prev)
    setSaving(false)
    setFeedback('Salvo!')
    setTimeout(() => setFeedback(''), 2000)
  }

  async function handleStatus(newStatus: string) {
    await patch({ status: newStatus })
  }

  async function saveTracking() {
    await patch({ tracking_code: trackingVal.trim() })
    setEditTracking(false)
  }

  async function saveCarrier() {
    await patch({ carrier: carrierVal.trim() })
    setEditCarrier(false)
  }

  if (loading) {
    return (
      <div className="min-h-full p-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 mb-10 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Pedidos
          </button>
          <div className="animate-pulse space-y-5">
            <div className="h-10 bg-zinc-100 rounded w-56" />
            <div className="h-48 bg-zinc-100 rounded" />
            <div className="h-72 bg-zinc-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-full p-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 mb-10 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Pedidos
          </button>
          <p className="text-zinc-400">Pedido não encontrado.</p>
        </div>
      </div>
    )
  }

  const stepIndex = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'Cancelado'
  const unitPrice = order.total / order.items

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
              Pedidos
            </button>
            <span className="text-zinc-200">/</span>
            <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-wide">{order.id}</h1>
            <span className={`text-xs font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded border ${STATUS_COLOR[order.status] ?? 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {feedback && <span className="text-sm text-emerald-600 font-semibold">{feedback}</span>}
            {saving && <span className="text-sm text-zinc-400">Salvando...</span>}
          </div>
        </div>

        {/* Timeline */}
        {!isCancelled && (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 mb-6">Progresso do pedido</p>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                      i <= stepIndex ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-300'
                    }`}>
                      {i < stepIndex ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-xs font-semibold mt-2 whitespace-nowrap ${i <= stepIndex ? 'text-zinc-900' : 'text-zinc-300'}`}>
                      {step}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 mb-5 ${i < stepIndex ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Esquerda: produto + cliente */}
          <div className="col-span-2 space-y-6">

            {/* Card do produto */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Produto</p>
              </div>
              <div className="flex gap-6 p-6">
                {/* Foto grande */}
                <div className="w-44 h-56 flex-shrink-0 bg-zinc-50 rounded-lg overflow-hidden relative">
                  {order.product_image ? (
                    <Image
                      src={order.product_image}
                      alt={order.product_name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-14 h-14 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info produto */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <p className="font-black text-zinc-900 text-base uppercase tracking-wide leading-snug">{order.product_name}</p>

                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-zinc-400">Quantidade</span>
                      <span className="text-sm font-semibold text-zinc-700">{order.items} unidade{order.items > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-zinc-400">Preço unitário</span>
                      <span className="text-sm font-semibold text-zinc-700">{fmt(unitPrice)}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-100 pt-3">
                      <span className="text-base font-bold text-zinc-900">Subtotal</span>
                      <span className="text-base font-black text-zinc-900">{fmt(order.total)}</span>
                    </div>
                  </div>

                  {order.product_slug && (
                    <a
                      href={`/produto/${order.product_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-900 transition-colors self-start"
                    >
                      Ver produto na loja
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Cliente */}
            <div className="bg-white border border-zinc-200 rounded-xl">
              <div className="px-6 py-4 border-b border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Cliente</p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-lg font-black text-zinc-500 flex-shrink-0">
                    {order.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-base">{order.customer_name}</p>
                    <p className="text-sm text-zinc-400 mt-0.5">{order.customer_email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Direita: resumo + status + envio */}
          <div className="space-y-6">

            {/* Resumo financeiro */}
            <div className="bg-white border border-zinc-200 rounded-xl">
              <div className="px-6 py-4 border-b border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Resumo</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400">Subtotal</span>
                  <span className="text-sm text-zinc-700">{fmt(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400">Frete</span>
                  <span className="text-sm text-emerald-600 font-semibold">Grátis</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-3">
                  <span className="text-base font-black text-zinc-900">Total</span>
                  <span className="text-base font-black text-zinc-900">{fmt(order.total)}</span>
                </div>
                <p className="text-xs text-zinc-400 pt-1">{fmtDate(order.created_at)}</p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white border border-zinc-200 rounded-xl">
              <div className="px-6 py-4 border-b border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Status</p>
              </div>
              <div className="p-6 space-y-3">
                {order.status === 'Novo' && (
                  <button
                    onClick={() => handleStatus('Processando')}
                    disabled={saving}
                    className="w-full py-3 bg-violet-600 text-white text-xs font-bold uppercase tracking-[0.1em] rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    Confirmar pedido
                  </button>
                )}
                {order.status === 'Processando' && (
                  <button
                    onClick={() => handleStatus('A caminho')}
                    disabled={saving}
                    className="w-full py-3 bg-blue-600 text-white text-xs font-bold uppercase tracking-[0.1em] rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Marcar como enviado
                  </button>
                )}
                {order.status === 'A caminho' && (
                  <button
                    onClick={() => handleStatus('Entregue')}
                    disabled={saving}
                    className="w-full py-3 bg-emerald-600 text-white text-xs font-bold uppercase tracking-[0.1em] rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    Confirmar entrega
                  </button>
                )}
                {order.status === 'Entregue' && (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Pedido entregue
                  </div>
                )}
                {!isCancelled && order.status !== 'Entregue' && (
                  <button
                    onClick={() => handleStatus('Cancelado')}
                    disabled={saving}
                    className="w-full py-2.5 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    Cancelar pedido
                  </button>
                )}
                {isCancelled && (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-bold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Pedido cancelado
                  </div>
                )}
              </div>
            </div>

            {/* Envio */}
            <div className="bg-white border border-zinc-200 rounded-xl">
              <div className="px-6 py-4 border-b border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Envio</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs text-zinc-400 mb-2">Transportadora</p>
                  {editCarrier ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={carrierVal}
                        onChange={e => setCarrierVal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveCarrier()}
                        placeholder="Ex: Correios, Jadlog..."
                        className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-600"
                      />
                      <button onClick={saveCarrier} className="text-sm text-white bg-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-700">OK</button>
                      <button onClick={() => { setEditCarrier(false); setCarrierVal(order.carrier ?? '') }} className="text-sm text-zinc-400 hover:text-zinc-700">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditCarrier(true)} className="text-left w-full hover:opacity-70 transition-opacity">
                      {order.carrier
                        ? <span className="text-sm font-semibold text-zinc-800">{order.carrier}</span>
                        : <span className="text-sm text-zinc-300">+ Adicionar transportadora</span>
                      }
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-xs text-zinc-400 mb-2">Código de rastreio</p>
                  {editTracking ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={trackingVal}
                        onChange={e => setTrackingVal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveTracking()}
                        placeholder="Ex: AA123456789BR"
                        className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-zinc-600"
                      />
                      <button onClick={saveTracking} className="text-sm text-white bg-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-700">OK</button>
                      <button onClick={() => { setEditTracking(false); setTrackingVal(order.tracking_code ?? '') }} className="text-sm text-zinc-400 hover:text-zinc-700">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditTracking(true)} className="text-left w-full hover:opacity-70 transition-opacity">
                      {order.tracking_code
                        ? <span className="text-sm font-mono font-semibold text-zinc-800">{order.tracking_code}</span>
                        : <span className="text-sm text-zinc-300">+ Adicionar código</span>
                      }
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
