'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import BrandLogo from '@/components/ui/BrandLogo'

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
  const [activeTab, setActiveTab] = useState<Tab>('perfil')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(
    user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? ''
  )

  // Pedidos
  type Order = { id: string; product_name: string; items: number; total: number; status: string; created_at: string }
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('orders')
      .select('id, product_name, items, total, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders((data ?? []).map(o => ({ ...o, total: Number(o.total) }))); setLoadingOrders(false) })
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
          <div>
            <h1 className="text-xl font-semibold text-ink mb-6">Pedidos</h1>
            {loadingOrders ? (
              <p className="text-sm text-muted">Carregando...</p>
            ) : orders.length === 0 ? (
              <div className="border border-border rounded-xl p-8 text-center">
                <p className="text-sm text-muted">Você ainda não fez nenhum pedido.</p>
                <Link href="/produtos" className="inline-block mt-4 text-xs font-bold uppercase tracking-[0.16em] underline underline-offset-4 text-muted hover:text-accent transition-colors">
                  Ver produtos
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-ink">{order.id}</p>
                        <p className="text-sm text-muted mt-0.5">{order.product_name}</p>
                        <p className="text-xs text-muted mt-1">
                          {order.items} {order.items === 1 ? 'item' : 'itens'} · {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-ink">{formatCurrency(order.total)}</p>
                        <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          order.status === 'Enviado' ? 'bg-blue-100 text-accent' :
                          order.status === 'Cancelado' ? 'bg-red-100 text-red-700' :
                          order.status === 'Novo' ? 'bg-violet-100 text-violet-700' :
                          'bg-card-hover text-muted'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <Link
                        href={`/rastreio/${encodeURIComponent(order.id)}`}
                        className="text-xs font-bold uppercase tracking-[0.12em] text-muted hover:text-accent underline underline-offset-2 transition-colors"
                      >
                        Rastrear pedido →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
