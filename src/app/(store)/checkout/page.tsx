'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import BrandLogo from '@/components/ui/BrandLogo'
import { BookImage } from '@/components/zine'
import { BRAND_NAME } from '@/lib/brand'

type Step = 'informacoes' | 'frete' | 'pagamento'

const STEPS: Step[] = ['informacoes', 'frete', 'pagamento']
const STEP_LABELS: Record<Step, string> = {
  informacoes: 'Informações',
  frete: 'Frete',
  pagamento: 'Pagamento',
}

/* ── Campo com validação ── */
function Field({
  placeholder,
  type = 'text',
  error,
  icon,
  className = '',
  inputRef,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  icon?: React.ReactNode
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <div className={className}>
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          className={[
            'w-full border px-3 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none bg-white transition-colors',
            error ? 'border-red-500 focus:border-red-500' : 'border-zinc-300 focus:border-zinc-900',
            icon ? 'pr-10' : '',
          ].join(' ')}
          {...props}
        />
        {icon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

/* ── Select com label flutuante ── */
function FloatingSelect({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative border border-zinc-300 bg-white px-3 pt-2 pb-1.5 focus-within:border-zinc-900 transition-colors ${className}`}>
      <span className="block text-[10px] text-zinc-400 leading-none mb-0.5">{label}</span>
      <select className="w-full text-sm text-zinc-900 bg-transparent focus:outline-none appearance-none pr-6">
        {children}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </span>
    </div>
  )
}

/* ── Checkbox ── */
function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer" onClick={onChange}>
      <div className={`mt-0.5 flex-shrink-0 w-4 h-4 border transition-colors flex items-center justify-center ${checked ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-400 bg-white'}`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>
      <span className="text-sm text-zinc-700 leading-snug">{label}</span>
    </label>
  )
}

/* ── Gift card upsell ── */
function GiftCard({
  title, subtitle, name, price, imageSrc, imageAlt, added, onToggle,
}: {
  title: string; subtitle?: string; name: string; price: string
  imageSrc: string; imageAlt: string; added: boolean; onToggle: () => void
}) {
  return (
    <div className={`border rounded-lg p-4 transition-colors ${added ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200'}`}>
      {title && <p className="text-sm font-medium text-zinc-900 mb-0.5">{title}</p>}
      {subtitle && <p className="text-xs text-zinc-400 mb-3">{subtitle}</p>}
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-zinc-100 flex-shrink-0 rounded overflow-hidden border border-zinc-200">
          <Image src={imageSrc} alt={imageAlt} width={64} height={64} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-900">{name}</p>
          <p className="text-xs text-zinc-500">{price}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`text-xs font-bold uppercase tracking-wide px-5 py-2.5 rounded transition-colors ${added ? 'bg-white border border-zinc-900 text-zinc-900 hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`}
        >
          {added ? 'Remover' : 'Adicionar'}
        </button>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const clearCart = useCartStore((s) => s.clearCart)
  const { user } = useAuth()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [step, setStep] = useState<Step>('informacoes')
  const [selectedShipping, setSelectedShipping] = useState<{ id: string; label: string; price: number } | null>(null)
  const [cpf, setCpf] = useState('')
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [coupon, setCoupon] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [discount, setDiscount] = useState(0)

  /* checkboxes */
  const [newsEmail, setNewsEmail] = useState(true)
  const [newsWhats, setNewsWhats] = useState(true)
  const [isGift, setIsGift] = useState(false)

  /* embrulho de presente */
  const [giftBag, setGiftBag] = useState(false)
  const [giftWrap, setGiftWrap] = useState(false)
  const GIFT_BAG_PRICE = 9
  const GIFT_WRAP_PRICE = 13.9
  const giftTotal = (giftBag ? GIFT_BAG_PRICE : 0) + (giftWrap ? GIFT_WRAP_PRICE : 0)

  /* endereço */
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [cep, setCep] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const [email, setEmail] = useState('')

  /* validação */
  const [emailError, setEmailError] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)

  // Pré-preenche com dados do usuário logado
  useEffect(() => {
    if (!user) return
    setEmail(user.email ?? '')
    const meta = user.user_metadata ?? {}
    const fullName: string = meta.full_name ?? meta.name ?? ''
    const parts = fullName.trim().split(' ')
    setNome(parts[0] ?? '')
    setSobrenome(parts.slice(1).join(' ') ?? '')

    async function loadAddress() {
      await supabase.auth.refreshSession()
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
        .limit(1)
        .single()
      if (error) { console.error('[Checkout] address:', error); return }
      if (!data) return
      setCep(data.zip ?? '')
      setRua(data.street ?? '')
      setNumero(data.number ?? '')
      setComplemento(data.complement ?? '')
      setBairro(data.neighborhood ?? '')
      setCidade(data.city ?? '')
      setEstado(data.state ?? '')
      setTelefone(data.phone ?? '')
    }
    loadAddress()
  }, [user])

  const handleCepChange = async (value: string) => {
    const digits = value.replace(/\D/g, '')
    setCep(digits)
    setCepError('')
    if (digits.length === 8) {
      setCepLoading(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
        const data = await res.json()
        if (data.erro) {
          setCepError('CEP não encontrado')
        } else {
          setRua(data.logradouro ?? '')
          setBairro(data.bairro ?? '')
          setCidade(data.localidade ?? '')
          setEstado(data.uf ?? '')
        }
      } catch {
        setCepError('Erro ao buscar CEP')
      } finally {
        setCepLoading(false)
      }
    }
  }

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const shipping = selectedShipping !== null ? selectedShipping.price : null
  const finalTotal = Math.max(0, total - discount) + (shipping ?? 0) + giftTotal

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return
    setCouponLoading(true)
    setCouponError('')
    setCouponSuccess('')
    setDiscount(0)

    const { data, error } = await supabaseAdmin
      .from('discounts')
      .select('*')
      .eq('code', coupon.trim().toUpperCase())
      .single()

    setCouponLoading(false)

    if (error || !data) { setCouponError('Cupom inválido.'); return }
    if (!data.active) { setCouponError('Este cupom não está ativo.'); return }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setCouponError('Este cupom expirou.'); return }
    if (data.usage_limit && data.usage_count >= data.usage_limit) { setCouponError('Este cupom atingiu o limite de usos.'); return }
    if (data.min_order && total < Number(data.min_order)) { setCouponError(`Pedido mínimo de ${formatCurrency(Number(data.min_order))} para este cupom.`); return }

    const value = Number(data.value)
    const discountAmount = data.type === 'percentual' ? (total * value) / 100 : value
    setDiscount(discountAmount)
    setCouponSuccess(`Cupom aplicado! ${data.type === 'percentual' ? `${value}% de desconto` : `${formatCurrency(value)} de desconto`}`)
  }
  const currentStepIndex = STEPS.indexOf(step)

  const handleBack = () => {
    const prev = STEPS[currentStepIndex - 1]
    if (prev) setStep(prev)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    /* validação simples do e-mail no step 1 */
    if (step === 'informacoes') {
      const val = email
      if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setEmailError('Insira um e-mail')
        emailRef.current?.focus()
        return
      }
      setEmailError('')
    }

    if (step !== 'pagamento') {
      const next = STEPS[currentStepIndex + 1]
      if (next) {
        setStep(next)
        if (next === 'frete' && !selectedShipping) setSelectedShipping({ id: 'pac', label: 'PAC — Correios', price: 19.9 })
      }
      return
    }

    setLoading(true)

    const firstName = items[0]?.product.name ?? 'Produto'
    const productLabel = items.length > 1
      ? `${firstName} + ${items.length - 1} outro${items.length > 2 ? 's' : ''}`
      : firstName
    const totalItems = items.reduce((s, i) => s + i.quantity, 0)
    const orderId = `#${Math.floor(10000 + Math.random() * 90000)}`

    const { error } = await supabase.from('orders').insert({
      id: orderId,
      user_id: user?.id ?? null,
      customer_name: user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Cliente',
      customer_email: user?.email ?? emailRef.current?.value ?? '',
      product_name: productLabel,
      items: totalItems,
      total: finalTotal,
      status: 'Novo',
      carrier: selectedShipping?.id === 'sedex' ? 'SEDEX — Correios' : selectedShipping?.id === 'pac' ? 'PAC — Correios' : selectedShipping?.id === 'gratis' ? 'Correios' : null,
    })

    if (error) {
      console.error('[Checkout] erro ao salvar pedido:', error)
    }

    // Decrementa estoque via API server-side (usa service role key)
    await fetch('/api/checkout/decrement-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({
          id: i.product.id,
          quantity: i.quantity,
          currentStock: i.product.stock,
        })),
      }),
    })

    clearCart()
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="bg-white p-12 text-center max-w-md w-full mx-4">
          <div className="w-12 h-12 border border-zinc-900 flex items-center justify-center mx-auto mb-6">
            <svg className="h-6 w-6 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 mb-3">Pedido Confirmado!</h1>
          <p className="text-sm text-zinc-500 mb-1">Seu pedido foi recebido com sucesso.</p>
          <p className="text-xs text-zinc-400 mb-8">Você receberá um e-mail com os detalhes e o código de rastreio em breve.</p>
          <Link href="/" className="inline-block bg-zinc-900 text-white text-xs font-bold tracking-[0.15em] uppercase px-8 py-3.5 hover:bg-zinc-700 transition-colors">
            Voltar para a Loja
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── ESQUERDA ── */}
      <div className="flex-1 bg-[#F5F5F5] lg:overflow-y-auto">
        <div className="max-w-[540px] ml-auto px-6 py-10 lg:py-14">

          {/* Logo */}
          <Link href="/" className="block mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <BrandLogo />
          </Link>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-8">
            <Link href="/carrinho" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">Carrinho</Link>
            {STEPS.map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <svg className="h-3 w-3 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <button
                  type="button"
                  onClick={() => i < currentStepIndex && setStep(s)}
                  className={[
                    'text-xs transition-colors',
                    i === currentStepIndex ? 'text-zinc-900 font-semibold' :
                    i < currentStepIndex ? 'text-zinc-400 hover:text-zinc-700 cursor-pointer' :
                    'text-zinc-300 cursor-default',
                  ].join(' ')}
                >
                  {STEP_LABELS[s]}
                </button>
              </span>
            ))}
          </nav>

          <form onSubmit={handleSubmit} noValidate className="space-y-8">

            {/* ── STEP 1: Informações ── */}
            {step === 'informacoes' && (
              <>
                {/* Contato */}
                <section>
                  <h2 className="text-base font-medium text-zinc-900 mb-4">Contato</h2>

                  <Field
                    placeholder="E-mail"
                    type="email"
                    inputRef={emailRef}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); emailError && setEmailError('') }}
                    error={emailError}
                  />

                  <div className="mt-3 space-y-2.5">
                    <CheckboxField label="Enviar novidades e ofertas para mim por e-mail" checked={newsEmail} onChange={() => setNewsEmail(!newsEmail)} />
                    <CheckboxField label="Quero receber descontos e novidades por WhatsApp" checked={newsWhats} onChange={() => setNewsWhats(!newsWhats)} />
                  </div>

                  <div className="mt-4">
                    <CheckboxField label="Esse pedido é um presente?" checked={isGift} onChange={() => setIsGift(!isGift)} />
                  </div>

                  {/* Gift upsell — sempre visível */}
                  <div className="mt-4 space-y-3">
                    <GiftCard
                      title={`Vai presentear? Dê um upgrade com a ${BRAND_NAME} Gift Bag`}
                      subtitle="Aviso: A sacola é enviada à parte para você montar."
                      name={`${BRAND_NAME} Gift Bag`} price="R$ 9,00"
                      imageSrc="/gift-bag-vero.png" imageAlt="Sacola de presente"
                      added={giftBag} onToggle={() => setGiftBag(v => !v)}
                    />
                    <GiftCard
                      title="Deixe o presente ainda mais especial"
                      name="Embalagem de Presente Prateada" price="R$ 13,90"
                      imageSrc="/gift-wrap-silver.png" imageAlt="Embalagem de presente prateada"
                      added={giftWrap} onToggle={() => setGiftWrap(v => !v)}
                    />
                  </div>
                </section>

                {/* Endereço */}
                <section>
                  <h2 className="text-base font-medium text-zinc-900 mb-4">Endereço de entrega</h2>
                  <div className="space-y-2.5">
                    <FloatingSelect label="País/Região">
                      <option value="brasil">Brasil</option>
                    </FloatingSelect>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field placeholder="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
                      <Field placeholder="Sobrenome" required value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} />
                    </div>
                    <Field
                      placeholder="CEP"
                      required
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      maxLength={8}
                      error={cepError}
                      icon={
                        cepLoading
                          ? <svg className="h-4 w-4 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                          : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                      }
                    />
                    <div className="grid grid-cols-[1fr_120px] gap-2.5">
                      <Field placeholder="Endereço" required value={rua} onChange={(e) => setRua(e.target.value)} />
                      <Field placeholder="Número" required value={numero} onChange={(e) => setNumero(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field placeholder="Apartamento, bloco etc. (opcional)" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
                      <Field placeholder="Bairro" required value={bairro} onChange={(e) => setBairro(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field placeholder="Cidade" required value={cidade} onChange={(e) => setCidade(e.target.value)} />
                      <div className="relative border border-zinc-300 bg-white focus-within:border-zinc-900 transition-colors">
                        <select
                          className="w-full px-3 py-3.5 text-sm text-zinc-900 bg-transparent focus:outline-none appearance-none pr-8"
                          value={estado}
                          onChange={(e) => setEstado(e.target.value)}
                        >
                          <option value="">Estado</option>
                          {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(uf => (
                            <option key={uf}>{uf}</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <Field
                      placeholder="Telefone"
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      icon={
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                        </svg>
                      }
                    />
                  </div>
                </section>
              </>
            )}

            {/* ── STEP 2: Frete ── */}
            {step === 'frete' && (
              <section className="space-y-6">
                {/* Resumo das etapas anteriores */}
                <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 text-sm">
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-zinc-400 w-24 flex-shrink-0">Contato</span>
                    <span className="text-zinc-700 flex-1 truncate">{email}</span>
                    <button type="button" onClick={() => setStep('informacoes')} className="text-xs text-blue-600 hover:underline flex-shrink-0">Alterar</button>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-zinc-400 w-24 flex-shrink-0">Enviar para</span>
                    <span className="text-zinc-700 flex-1 text-xs leading-snug">
                      {[rua, numero, bairro, cep, cidade, estado, 'Brasil'].filter(Boolean).join(', ')}
                    </span>
                    <button type="button" onClick={() => setStep('informacoes')} className="text-xs text-blue-600 hover:underline flex-shrink-0">Alterar</button>
                  </div>
                </div>

                {/* Opções de frete */}
                <div>
                  <h2 className="text-base font-medium text-zinc-900 mb-3">Forma de frete</h2>
                  <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 overflow-hidden">
                    {[
                      { id: 'gratis', label: 'Frete Grátis', desc: '7 a 12 dias úteis', price: 0, disabled: total < 399 },
                      { id: 'pac', label: 'PAC — Correios', desc: '5 a 8 dias úteis', price: 19.9 },
                      { id: 'sedex', label: 'SEDEX — Correios', desc: '1 a 3 dias úteis', price: 34.9 },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between px-4 py-4 cursor-pointer transition-colors ${
                          opt.disabled ? 'opacity-40 cursor-not-allowed bg-white' :
                          selectedShipping?.id === opt.id ? 'bg-zinc-50' : 'bg-white hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio" name="shipping" value={opt.id}
                            checked={selectedShipping?.id === opt.id}
                            disabled={opt.disabled}
                            onChange={() => !opt.disabled && setSelectedShipping({ id: opt.id, label: opt.label, price: opt.price })}
                            className="accent-zinc-900 w-4 h-4"
                          />
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{opt.label}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {opt.disabled ? 'Disponível acima de R$ 399' : opt.desc}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-zinc-900 flex-shrink-0">
                          {opt.price === 0 ? 'GRÁTIS' : formatCurrency(opt.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── STEP 3: Pagamento ── */}
            {step === 'pagamento' && (
              <section className="space-y-6">
                {/* Resumo das etapas anteriores */}
                <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 text-sm">
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-zinc-400 w-24 flex-shrink-0">Contato</span>
                    <span className="text-zinc-700 flex-1 truncate">{email}</span>
                    <button type="button" onClick={() => setStep('informacoes')} className="text-xs text-blue-600 hover:underline flex-shrink-0">Alterar</button>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-zinc-400 w-24 flex-shrink-0">Enviar para</span>
                    <span className="text-zinc-700 flex-1 text-xs leading-snug">
                      {[rua, numero, bairro, cep, cidade, estado, 'Brasil'].filter(Boolean).join(', ')}
                    </span>
                    <button type="button" onClick={() => setStep('informacoes')} className="text-xs text-blue-600 hover:underline flex-shrink-0">Alterar</button>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-zinc-400 w-24 flex-shrink-0">Frete</span>
                    <span className="text-zinc-700 flex-1 text-sm">
                      {selectedShipping ? `${selectedShipping.label} · ${selectedShipping.price === 0 ? 'GRÁTIS' : formatCurrency(selectedShipping.price)}` : '—'}
                    </span>
                    <button type="button" onClick={() => setStep('frete')} className="text-xs text-blue-600 hover:underline flex-shrink-0">Alterar</button>
                  </div>
                </div>

                {/* CPF/CNPJ */}
                <div>
                  <h2 className="text-base font-medium text-zinc-900 mb-1">CPF/CNPJ obrigatório para emitir nota fiscal</h2>
                  <Field
                    placeholder="CPF/CNPJ"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                </div>

                {/* Pagamento */}
                <div>
                  <h2 className="text-base font-medium text-zinc-900">Pagamento</h2>
                  <p className="text-xs text-zinc-400 mt-0.5 mb-4">Todas as transações são seguras e criptografadas.</p>

                  {/* Banner PIX */}
                  <div className="flex items-start gap-2.5 border border-zinc-200 rounded-lg px-4 py-3 mb-3 bg-zinc-50">
                    <svg className="h-4 w-4 flex-shrink-0 text-zinc-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">2% OFF no Pix</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Desbloqueie 2% OFF a mais em pagamento via PIX</p>
                    </div>
                  </div>

                  {/* PIX único selecionado */}
                  <div className="border-2 border-zinc-900 rounded-lg px-4 py-3.5 flex items-center gap-3 bg-white">
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-900 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-zinc-900" />
                    </div>
                    <span className="text-sm font-medium text-zinc-900">Pix</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">O QR Code será exibido após confirmar o pedido.</p>
                </div>

                {/* Endereço de faturamento */}
                <div>
                  <h2 className="text-base font-medium text-zinc-900 mb-1">Endereço de faturamento</h2>
                  <p className="text-xs text-zinc-400 mb-3">Selecione o endereço que corresponde ao seu método de pagamento.</p>
                  <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 overflow-hidden">
                    <label className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer ${useSameAddress ? 'bg-zinc-50' : 'bg-white hover:bg-zinc-50'}`}>
                      <input type="radio" name="billing" checked={useSameAddress} onChange={() => setUseSameAddress(true)} className="accent-zinc-900 w-4 h-4" />
                      <span className="text-sm text-zinc-800">Usar o endereço de entrega</span>
                    </label>
                    <label className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer ${!useSameAddress ? 'bg-zinc-50' : 'bg-white hover:bg-zinc-50'}`}>
                      <input type="radio" name="billing" checked={!useSameAddress} onChange={() => setUseSameAddress(false)} className="accent-zinc-900 w-4 h-4" />
                      <span className="text-sm text-zinc-800">Usar um endereço de faturamento diferente</span>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {/* Navegação */}
            <div className="flex items-center justify-between pt-2">
              {step === 'informacoes' ? (
                <Link href="/carrinho" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Voltar ao carrinho
                </Link>
              ) : (
                <button type="button" onClick={handleBack} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  {step === 'frete' ? 'Voltar para as informações' : 'Voltar para o frete'}
                </button>
              )}

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="bg-zinc-900 text-white text-sm font-medium px-8 py-3.5 hover:bg-zinc-700 transition-colors disabled:opacity-50 rounded"
              >
                {loading ? 'Processando...' :
                  step === 'informacoes' ? 'Continuar para frete' :
                  step === 'frete' ? 'Continuar com o pagamento' :
                  'Finalizar a compra'}
              </button>
            </div>

            {/* Footer links */}
            <div className="pt-6 border-t border-zinc-200 flex flex-wrap gap-x-4 gap-y-1">
              {['Política de reembolso', 'Frete', 'Política de privacidade', 'Termos de serviço', 'Cancelamentos', 'Contato'].map((l) => (
                <a key={l} href="#" className="text-xs text-zinc-400 hover:text-zinc-700 underline transition-colors">{l}</a>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* ── DIREITA: Resumo ── */}
      <div className="lg:w-[45%] bg-white border-l border-zinc-200 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="max-w-[400px] mr-auto px-6 pt-4 pb-10 lg:pt-14 lg:pb-14 lg:sticky lg:top-0">

          {/* Itens */}
          <div className="space-y-4 mb-6" suppressHydrationWarning>
            {!mounted || items.length === 0 ? (
              <p className="text-sm text-zinc-400">{mounted ? 'Nenhum item no carrinho.' : ''}</p>
            ) : items.map((item) => (
              <div key={item.product.id} className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-16 bg-zinc-100 overflow-hidden rounded">
                    <BookImage src={item.product.images[0]} title={item.product.name} />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-500 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug">{item.product.name}</p>
                  {item.product.colors?.[0] && (
                    <p className="text-xs text-zinc-400 mt-0.5">{item.product.colors[0].name}</p>
                  )}
                </div>
                <p className="text-sm font-medium text-zinc-900 flex-shrink-0">
                  {formatCurrency(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Cupom */}
          <div className="mb-5">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cupom de desconto"
                value={coupon}
                onChange={(e) => { setCoupon(e.target.value); setCouponError(''); setCouponSuccess('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                className={`flex-1 border px-3 py-2.5 text-sm placeholder-zinc-400 focus:outline-none bg-white transition-colors uppercase ${couponError ? 'border-red-400' : couponSuccess ? 'border-green-500' : 'border-zinc-300 focus:border-zinc-900'}`}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !coupon.trim()}
                className="border border-zinc-300 px-4 py-2.5 text-sm text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {couponLoading ? '...' : 'Aplicar'}
              </button>
            </div>
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-green-600 mt-1">{couponSuccess}</p>}
          </div>

          {/* Aviso */}
          <div className="flex items-start gap-2.5 bg-zinc-50 border border-zinc-200 p-3.5 mb-6 text-xs text-zinc-600 rounded">
            <svg className="h-4 w-4 flex-shrink-0 text-zinc-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p>
              Teve problemas ao finalizar o pedido?{' '}
              <a href="#" className="underline hover:text-zinc-900 transition-colors">Reporte o problema nesse formulário</a>.
            </p>
          </div>

          {/* Totais */}
          <div className="space-y-2.5 text-sm border-t border-zinc-100 pt-4" suppressHydrationWarning>
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span suppressHydrationWarning>{mounted ? formatCurrency(total) : '—'}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
            )}
            {giftBag && (
              <div className="flex justify-between text-zinc-600">
                <span className="flex items-center gap-1">🎁 {BRAND_NAME} Gift Bag</span>
                <span>{formatCurrency(GIFT_BAG_PRICE)}</span>
              </div>
            )}
            {giftWrap && (
              <div className="flex justify-between text-zinc-600">
                <span className="flex items-center gap-1">🎁 Embalagem Prateada</span>
                <span>{formatCurrency(GIFT_WRAP_PRICE)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span className="flex items-center gap-1">
                Frete
                {step !== 'pagamento' && (
                  <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                )}
              </span>
              {shipping === null ? (
                <span className="text-zinc-400 text-xs">Calculado na próxima etapa</span>
              ) : (
                <span suppressHydrationWarning className={shipping === 0 ? 'text-green-700 font-medium' : ''}>
                  {shipping === 0 ? 'Grátis' : formatCurrency(shipping)}
                </span>
              )}
            </div>
            <div className="flex justify-between font-bold text-zinc-900 text-base pt-3 border-t border-zinc-100">
              <span>Total</span>
              <span className="flex items-baseline gap-2">
                <span className="text-xs font-normal text-zinc-400">BRL</span>
                <span suppressHydrationWarning>{mounted ? formatCurrency(finalTotal) : '—'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
