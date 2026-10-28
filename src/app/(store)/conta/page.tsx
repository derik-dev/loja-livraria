'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import BrandLogo from '@/components/ui/BrandLogo'
import { mockProducts } from '@/lib/data/products'
import { BookImage } from '@/components/zine'

type Tab = 'pedidos' | 'favoritos' | 'trocas' | 'suporte' | 'perfil'

interface Address {
  id: string
  name: string
  street: string
  number: string
  complement?: string
  neighborhood?: string
  city: string
  state: string
  zip: string
  phone?: string
  is_default: boolean
}

const EMPTY_FORM: Omit<Address, 'id' | 'is_default'> = {
  name: '', street: '', number: '', complement: '',
  neighborhood: '', city: '', state: '', zip: '', phone: '',
}

const NAV_TABS: { key: Tab; label: string }[] = [
  { key: 'pedidos', label: 'Pedidos' },
  { key: 'favoritos', label: 'Favoritos' },
  { key: 'trocas', label: 'Trocas' },
  { key: 'suporte', label: 'Suporte' },
  { key: 'perfil', label: 'Perfil' },
]

export default function ContaPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('pedidos')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(
    user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? ''
  )

  // Pedidos
  type Order = { id: string; product_name: string; items: number; total: number; status: string; created_at: string }
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const userId = user.id
    let active = true

    async function loadOrders() {
      setLoadingOrders(true)
      setOrdersError(null)
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, product_name, items, total, status, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!active) return
        if (error) {
          setOrdersError('Não foi possível carregar seus pedidos agora.')
        } else {
          setOrders((data ?? []).map(o => ({ ...o, total: Number(o.total) })))
        }
      } catch {
        if (active) setOrdersError('Não foi possível carregar seus pedidos agora.')
      } finally {
        if (active) setLoadingOrders(false)
      }
    }

    void loadOrders()
    return () => { active = false }
  }, [user])

  // Endereços
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [cepLoading, setCepLoading] = useState(false)

  async function handleZipChange(value: string) {
    const digits = value.replace(/\D/g, '')
    setForm(f => ({ ...f, zip: digits }))
    if (digits.length === 8) {
      setCepLoading(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setForm(f => ({
            ...f,
            street: data.logradouro ?? f.street,
            neighborhood: data.bairro ?? f.neighborhood,
            city: data.localidade ?? f.city,
            state: data.uf ?? f.state,
          }))
        }
      } catch { /* silently fail */ }
      finally { setCepLoading(false) }
    }
  }

  const displayName = nameValue || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'
  const email = user?.email ?? ''
  const initial = displayName[0]?.toUpperCase() ?? '?'
  const completedOrders = orders.filter((order) => order.status !== 'Cancelado')
  const purchasedItemCount = completedOrders.reduce((total, order) => total + Number(order.items || 0), 0)
  const totalSpent = completedOrders.reduce((total, order) => total + order.total, 0)
  const activeOrderCount = completedOrders.filter((order) => !['Entregue', 'Concluído'].includes(order.status)).length

  useEffect(() => {
    if (!user) return
    fetchAddresses()
  }, [user])

  async function fetchAddresses() {
    setLoadingAddresses(true)
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user!.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })
    setAddresses(data ?? [])
    setLoadingAddresses(false)
  }

  function openNew() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(addr: Address) {
    setEditingId(addr.id)
    setForm({
      name: addr.name, street: addr.street, number: addr.number,
      complement: addr.complement ?? '', neighborhood: addr.neighborhood ?? '',
      city: addr.city, state: addr.state, zip: addr.zip, phone: addr.phone ?? '',
    })
    setFormError(null)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)

    // Garante sessão válida antes de salvar
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const { data } = await supabase.auth.refreshSession()
      if (!data.session) {
        setFormError('Sessão expirada. Faça login novamente.')
        setSaving(false)
        return
      }
    }

    const payload = { ...form, user_id: user!.id }

    if (editingId) {
      const { error } = await supabase.from('addresses').update(payload).eq('id', editingId)
      if (error) { console.error('[Addresses] update error:', error); setFormError(`Erro: ${error.message}`); setSaving(false); return }
    } else {
      const isFirst = addresses.length === 0
      const { error } = await supabase.from('addresses').insert({ ...payload, is_default: isFirst })
      if (error) { console.error('[Addresses] insert error:', error); setFormError(`Erro: ${error.message}`); setSaving(false); return }
    }

    await fetchAddresses()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('addresses').delete().eq('id', id)
    await fetchAddresses()
  }

  async function handleSetDefault(id: string) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user!.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    await fetchAddresses()
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  function field(key: keyof typeof form, label: string, opts?: { placeholder?: string; half?: boolean }) {
    return (
      <div className={opts?.half ? '' : 'sm:col-span-2'}>
        <label className="block text-xs text-muted mb-1">{label}</label>
        <input
          value={form[key] ?? ''}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts?.placeholder}
          className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>
    )
  }

  return (
    <div data-tone="light" className="min-h-screen bg-bg flex flex-col">

      {/* Header da conta */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <BrandLogo />
          </Link>
          <nav className="flex items-center gap-6 overflow-x-auto">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-sm whitespace-nowrap py-4 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-accent text-ink font-semibold'
                    : 'border-transparent text-muted hover:text-accent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex-shrink-0 h-8 w-8 rounded-full border border-border-strong flex items-center justify-center text-xs font-bold text-ink">
            {initial}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* ── PERFIL ── */}
        {activeTab === 'perfil' && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold text-ink mb-6">Perfil</h1>

            {/* Card dados */}
            <div className="border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                {editingName ? (
                  <input
                    autoFocus
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                    className="text-base font-semibold text-ink border-b border-border-strong focus:outline-none bg-transparent"
                  />
                ) : (
                  <span className="text-base font-semibold text-ink">{displayName}</span>
                )}
                <button
                  onClick={() => setEditingName(true)}
                  className="text-muted hover:text-ink transition-colors ml-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-muted mb-0.5">E-mail</p>
              <p className="text-sm text-ink">{email}</p>
            </div>

            {/* Card endereços */}
            <div className="border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-ink">Endereços</span>
                {!showForm && (
                  <button
                    onClick={openNew}
                    className="text-sm text-muted hover:text-accent transition-colors"
                  >
                    + Adicionar
                  </button>
                )}
              </div>

              {/* Form novo/editar */}
              {showForm && (
                <form onSubmit={handleSave} className="mb-5 border border-border rounded-lg p-4 bg-bg-alt">
                  <p className="text-sm font-semibold text-ink mb-4">
                    {editingId ? 'Editar endereço' : 'Novo endereço'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field('name', 'Nome do destinatário')}
                    <div>
                      <label className="block text-xs text-muted mb-1">CEP</label>
                      <div className="relative">
                        <input
                          value={form.zip}
                          onChange={e => handleZipChange(e.target.value)}
                          placeholder="00000-000"
                          maxLength={8}
                          className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors pr-8"
                        />
                        {cepLoading && (
                          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    {field('state', 'Estado (UF)', { half: true, placeholder: 'RJ' })}
                    {field('street', 'Rua / Avenida')}
                    {field('number', 'Número', { half: true })}
                    {field('complement', 'Complemento', { half: true, placeholder: 'Apto, Bloco...' })}
                    {field('neighborhood', 'Bairro', { half: true })}
                    {field('city', 'Cidade', { half: true })}
                    {field('phone', 'Telefone', { placeholder: '(99) 99999-9999' })}
                  </div>
                  {formError && <p className="text-xs text-red-600 mt-2">{formError}</p>}
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-accent text-on-accent text-xs font-bold uppercase tracking-[0.14em] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2 border border-border-strong text-xs font-bold uppercase tracking-[0.14em] rounded-lg text-muted hover:border-accent transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Lista */}
              {loadingAddresses ? (
                <p className="text-sm text-muted">Carregando...</p>
              ) : addresses.length === 0 ? (
                <p className="text-sm text-muted italic">Nenhum endereço cadastrado.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm text-ink leading-relaxed">
                          {addr.is_default && (
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted mb-1">
                              Endereço padrão
                            </p>
                          )}
                          <p className="font-semibold text-ink">{addr.name}</p>
                          <p>{addr.street}, {addr.number}{addr.complement ? `, ${addr.complement}` : ''}</p>
                          {addr.neighborhood && <p>{addr.neighborhood}</p>}
                          <p>{addr.zip} {addr.city} {addr.state}</p>
                          {addr.phone && <p>{addr.phone}</p>}
                        </div>
                        <button
                          onClick={() => openEdit(addr)}
                          className="text-muted hover:text-ink flex-shrink-0"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex gap-3 mt-3">
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-xs text-muted hover:text-accent underline underline-offset-2 transition-colors"
                          >
                            Definir como padrão
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(addr.id)}
                          className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sair */}
            <div className="pt-2">
              <button
                onClick={handleSignOut}
                className="border border-border-strong rounded-lg px-5 py-2 text-sm text-ink hover:border-accent hover:text-accent transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        )}

        {/* ── PEDIDOS ── */}
        {activeTab === 'pedidos' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Sua estante</p>
                <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Olá, {displayName}</h1>
                <p className="mt-2 text-sm text-muted">Acompanhe seus pedidos e relembre suas leituras.</p>
              </div>
              <Link href="/produtos" className="btn-primary !min-h-[42px] !px-5 !py-2 !text-sm">Explorar livros</Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">Pedidos</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{loadingOrders ? '—' : orders.length}</p>
                <p className="mt-1 text-xs text-muted">compras registradas</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">Livros comprados</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{loadingOrders ? '—' : purchasedItemCount}</p>
                <p className="mt-1 text-xs text-muted">unidades em pedidos não cancelados</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">Total investido</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{loadingOrders ? '—' : formatCurrency(totalSpent)}</p>
                <p className="mt-1 text-xs text-muted">{activeOrderCount} pedido{activeOrderCount === 1 ? '' : 's'} em andamento</p>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Seus pedidos</h2>
                  <p className="mt-1 text-sm text-muted">Compras recentes e atualizações de entrega.</p>
                </div>
                {!loadingOrders && orders.length > 0 && <span className="text-xs text-muted">{orders.length} no total</span>}
              </div>
            {loadingOrders ? (
              <div className="rounded-xl border border-border p-8 text-center text-sm text-muted">Carregando seus pedidos...</div>
            ) : ordersError ? (
              <div role="alert" className="rounded-xl border border-border p-8 text-center">
                <p className="text-sm text-muted">{ordersError}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-sm font-semibold text-accent underline underline-offset-4">Tentar novamente</button>
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center sm:p-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-card-hover text-accent" aria-hidden="true">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8.5h14l1 12H4l1-12Zm3.5 0V6a3.5 3.5 0 0 1 7 0v2.5" /></svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink">Sua próxima leitura começa aqui</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">Quando você fizer uma compra, os livros, valores e atualizações de entrega vão aparecer nesta área.</p>
                <Link href="/produtos" className="btn-primary mt-6 inline-flex !min-h-[44px] !px-6 !py-2.5 !text-sm">
                  Ver catálogo
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const lineItems = order.product_name.split(' • ').map((label) => {
                    const quantityMatch = label.match(/\s+\((\d+)x\)$/)
                    const name = quantityMatch ? label.slice(0, quantityMatch.index) : label
                    return {
                      name,
                      quantity: Number(quantityMatch?.[1] ?? order.items),
                      product: mockProducts.find((item) => item.name === name) ?? mockProducts.find((item) => name.startsWith(item.name)),
                    }
                  })
                  const statusClass = order.status === 'Enviado' || order.status === 'Entregue'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'Cancelado'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-accent/15 text-espresso'

                  return (
                    <article key={order.id} className="overflow-hidden rounded-xl border border-border bg-card">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card-hover/50 px-5 py-3">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                          <span className="font-semibold text-ink">Pedido {order.id}</span>
                          <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{order.status}</span>
                      </div>
                      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1 space-y-3">
                          {lineItems.map((lineItem, index) => (
                            <div key={`${lineItem.name}-${index}`} className="flex items-center gap-3">
                              <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-md bg-card-hover ring-1 ring-border">
                                <BookImage src={lineItem.product?.images[0]} title={lineItem.name} sizes="56px" />
                              </div>
                              <div className="min-w-0">
                                {lineItem.product ? (
                                  <Link href={`/produto/${lineItem.product.slug}`} className="line-clamp-2 font-semibold text-ink hover:text-accent">{lineItem.name}</Link>
                                ) : (
                                  <h3 className="line-clamp-2 font-semibold text-ink">{lineItem.name}</h3>
                                )}
                                <p className="mt-1 text-sm text-muted">Quantidade: {lineItem.quantity}</p>
                              </div>
                            </div>
                          ))}
                          <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-muted">Total do pedido</p>
                          <p className="mt-0.5 text-lg font-semibold text-ink">{formatCurrency(order.total)}</p>
                        </div>
                        <Link
                          href={`/rastreio/${encodeURIComponent(order.id)}`}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                        >
                          Acompanhar pedido
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
            </div>
          </div>
        )}

        {/* ── FAVORITOS ── */}
        {activeTab === 'favoritos' && (
          <div>
            <h1 className="text-xl font-semibold text-ink mb-6">Favoritos</h1>
            <div className="border border-border rounded-xl p-8 text-center">
              <p className="text-sm text-muted">Você não tem produtos favoritos ainda.</p>
              <Link href="/produtos" className="inline-block mt-4 text-xs font-bold uppercase tracking-[0.16em] underline underline-offset-4 text-muted hover:text-accent transition-colors">
                Explorar produtos
              </Link>
            </div>
          </div>
        )}

        {/* ── TROCAS ── */}
        {activeTab === 'trocas' && (
          <div>
            <h1 className="text-xl font-semibold text-ink mb-6">Trocas</h1>
            <div className="border border-border rounded-xl p-8 text-center">
              <p className="text-sm text-muted">Nenhuma solicitação de troca encontrada.</p>
            </div>
          </div>
        )}

        {/* ── SUPORTE ── */}
        {activeTab === 'suporte' && (
          <div>
            <h1 className="text-xl font-semibold text-ink mb-6">Suporte</h1>
            <div className="border border-border rounded-xl p-6 space-y-4">
              <p className="text-sm text-muted">Precisa de ajuda? Entre em contato pelo WhatsApp ou e-mail.</p>
              <a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border-strong rounded-lg px-5 py-2.5 text-sm text-ink hover:border-accent hover:text-accent transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-4 justify-center">
          {['Política de reembolso', 'Frete', 'Política de privacidade', 'Termos de serviço', 'Cancelamentos', 'Informações de contato'].map((item) => (
            <Link key={item} href="#" className="text-xs text-muted hover:text-ink transition-colors underline underline-offset-2">
              {item}
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
