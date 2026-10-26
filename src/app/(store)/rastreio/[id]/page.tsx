'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

type Order = {
  id: string
  product_name: string
  items: number
  total: number
  status: string
  tracking_code?: string
  created_at: string
}

const TIMELINE = [
  {
    status: 'Novo',
    label: 'Pedido recebido',
    desc: 'Recebemos seu pedido e ele está aguardando confirmação.',
    icon: '📦',
  },
  {
    status: 'Processando',
    label: 'Em preparação',
    desc: 'Seu pedido foi confirmado e está sendo separado e embalado com cuidado.',
    icon: '🏷️',
  },
  {
    status: 'A caminho',
    label: 'A caminho',
    desc: 'Seu pedido foi enviado e está a caminho do seu endereço.',
    icon: '🚚',
  },
  {
    status: 'Entregue',
    label: 'Encomenda entregue',
    desc: 'Seu pedido foi entregue. Aproveite!',
    icon: '✅',
  },
]

const STATUS_ORDER = ['Novo', 'Processando', 'A caminho', 'Entregue']

function getStepIndex(status: string) {
  const i = STATUS_ORDER.indexOf(status)
  return i === -1 ? 0 : i
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function RastreioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabaseAdmin
      .from('orders')
      .select('id, product_name, items, total, status, tracking_code, created_at')
      .eq('id', decodeURIComponent(id))
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setOrder({ ...data, total: Number(data.total) || 0, items: data.items ?? 0 })
        setLoading(false)
      })
  }, [id])

  const stepIndex = order ? getStepIndex(order.status) : 0
  const cancelled = order?.status === 'Cancelado'

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="h-6 w-32 bg-zinc-100 rounded animate-pulse mx-auto mb-3" />
            <div className="h-4 w-48 bg-zinc-100 rounded animate-pulse mx-auto" />
          </div>
        )}

        {notFound && (
          <div className="bg-white rounded-2xl p-12 text-center space-y-4">
            <p className="text-4xl">📭</p>
            <p className="text-lg font-bold text-zinc-900">Pedido não encontrado</p>
            <p className="text-sm text-zinc-500">Verifique o número do pedido ou acesse sua conta.</p>
            <Link href="/conta" className="inline-block mt-2 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-zinc-700 transition-colors">
              Minha conta
            </Link>
          </div>
        )}

        {order && (
          <div className="space-y-4">

            {/* Card principal */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Rastreio do pedido</p>
                  <h1 className="text-2xl font-black text-zinc-900">{order.id}</h1>
                  <p className="text-sm text-zinc-500 mt-1">{order.product_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400 mb-0.5">{order.items} {order.items === 1 ? 'item' : 'itens'}</p>
                  <p className="text-lg font-black text-zinc-900">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{fmtDate(order.created_at)}</p>
                </div>
              </div>

              {/* Status badge */}
              {!cancelled && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-8 ${
                  order.status === 'Entregue' ? 'bg-emerald-50 text-emerald-700' :
                  order.status === 'A caminho' ? 'bg-blue-50 text-blue-700' :
                  order.status === 'Processando' ? 'bg-amber-50 text-amber-700' :
                  'bg-violet-50 text-violet-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {order.status === 'Novo' ? 'Aguardando confirmação' :
                   order.status === 'Processando' ? 'Em preparação' :
                   order.status === 'A caminho' ? 'A caminho' : 'Entregue'}
                </div>
              )}

              {cancelled ? (
                <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-xl px-5 py-4">
                  <span className="text-3xl">❌</span>
                  <div>
                    <p className="font-bold text-red-700">Pedido cancelado</p>
                    <p className="text-sm text-red-500 mt-0.5">Este pedido foi cancelado. Entre em contato com o suporte se precisar de ajuda.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {TIMELINE.map((t, i) => {
                    const done = i <= stepIndex
                    const active = i === stepIndex
                    const isLast = i === TIMELINE.length - 1

                    return (
                      <div key={t.status} className="flex gap-5">
                        {/* Indicador */}
                        <div className="flex flex-col items-center">
                          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all ${
                            done ? 'bg-zinc-900 shadow-md' : 'bg-zinc-100'
                          }`}>
                            {done
                              ? <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                              : <span className="text-base">{t.icon}</span>
                            }
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 flex-1 my-1 min-h-[32px] transition-colors ${i < stepIndex ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div className={`pb-8 pt-1.5 ${isLast ? 'pb-0' : ''}`}>
                          <p className={`font-bold text-sm ${done ? 'text-zinc-900' : 'text-zinc-400'}`}>
                            {t.label}
                          </p>
                          {active && (
                            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{t.desc}</p>
                          )}
                          {done && !active && (
                            <p className="text-xs text-zinc-400 mt-0.5">Concluído</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Card de código de rastreio */}
            {order.tracking_code && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Código de rastreio</p>
                <div className="flex items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Correios</p>
                    <p className="font-mono font-bold text-zinc-900 text-lg tracking-wider">{order.tracking_code}</p>
                  </div>
                  <a
                    href="https://rastreamento.correios.com.br/app/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Rastrear →
                  </a>
                </div>
                <p className="text-xs text-zinc-400 mt-3">
                  O rastreio pode levar até 24h para ser atualizado no site dos Correios após o envio.
                </p>
              </div>
            )}

            {/* Ajuda */}
            <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-zinc-900">Precisa de ajuda?</p>
                <p className="text-xs text-zinc-500 mt-0.5">Fale com nosso suporte pelo WhatsApp</p>
              </div>
              <a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-zinc-300 text-zinc-700 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg hover:border-zinc-900 hover:text-zinc-900 transition-colors"
              >
                WhatsApp
              </a>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
