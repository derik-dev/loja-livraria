'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import BrandLogo from '@/components/ui/BrandLogo'
import { BookImage } from '@/components/zine'
import { BRAND_NAME } from '@/lib/brand'
import { MethodPicker, type PayMethod } from '@/components/checkout/PaymentSimulator'
import { GIFT_BAG_PRICE, GIFT_WRAP_PRICE, PIX_DISCOUNT_RATE, saveDraft } from '@/lib/checkoutDraft'

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
            'w-full border px-3 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none bg-card transition-colors',
            error ? 'border-red-500 focus:border-red-500' : 'border-border-strong focus:border-accent',
            icon ? 'pr-10' : '',
          ].join(' ')}
          {...props}
        />
        {icon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
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
    <div className={`relative rounded-lg border border-border-strong bg-card px-3 pt-2 pb-1.5 focus-within:border-accent transition-colors ${className}`}>
      <span className="block text-[10px] text-muted leading-none mb-0.5">{label}</span>
      <select className="w-full appearance-none pr-6 text-sm text-ink focus:outline-none !rounded-none !border-0 !bg-transparent !shadow-none">
        {children}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
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
      <div className={`mt-0.5 flex-shrink-0 w-4 h-4 border transition-colors flex items-center justify-center ${checked ? 'bg-accent border-accent' : 'border-border-strong bg-card'}`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-on-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>
      <span className="text-sm text-ink leading-snug">{label}</span>
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
    <div className={`border rounded-lg p-4 transition-colors ${added ? 'border-accent bg-bg-alt' : 'border-border'}`}>
      {title && <p className="text-sm font-medium text-ink mb-0.5">{title}</p>}
      {subtitle && <p className="text-xs text-muted mb-3">{subtitle}</p>}
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-card-hover flex-shrink-0 rounded overflow-hidden border border-border">
          <Image src={imageSrc} alt={imageAlt} width={64} height={64} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">{name}</p>
          <p className="text-xs text-muted">{price}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`text-xs font-bold uppercase tracking-wide px-5 py-2.5 rounded transition-colors ${added ? 'bg-card border border-accent text-ink hover:bg-card-hover' : 'bg-accent text-on-accent hover:opacity-90'}`}
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
  const { user } = useAuth()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [step, setStep] = useState<Step>('informacoes')
  const [selectedShipping, setSelectedShipping] = useState<{ id: string; label: string; price: number } | null>(null)
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
  const formRef = useRef<HTMLFormElement>(null)

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
        .maybeSingle()
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

  const router = useRouter()
  // A forma de pagamento é escolhida aqui; o pagamento (simulado) acontece na página do Pix ou do cartão.
  const [payMethod, setPayMethod] = useState<PayMethod>('pix')

  const shipping = selectedShipping !== null ? selectedShipping.price : null
  const baseTotal = Math.max(0, total - discount) + (shipping ?? 0) + giftTotal
  // 2% de desconto no Pix, só quando a pessoa chega ao pagamento e escolhe Pix.
  const pixDiscount = step === 'pagamento' && payMethod === 'pix' ? Math.round(Math.max(0, total - discount) * PIX_DISCOUNT_RATE * 100) / 100 : 0
  const finalTotal = baseTotal - pixDiscount

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

    // Última etapa: guarda os dados e segue para a página do Pix ou do cartão.
    saveDraft({
      email,
      nome,
      sobrenome,
      address: [rua, numero, bairro, cep, cidade, estado, 'Brasil'].filter(Boolean).join(', '),
      shipping: selectedShipping,
      discount,
      giftBag,
      giftWrap,
    })
    router.push(payMethod === 'pix' ? '/checkout/pix' : '/checkout/cartao')
  }

  return (
    <div data-tone="light" className="min-h-screen flex flex-col lg:flex-row">

      {/* ── ESQUERDA ── */}
      <div className="flex-1 bg-bg lg:overflow-y-auto">
        <div className="max-w-[540px] ml-auto px-6 py-10 lg:py-14">

          {/* Logo */}
          <Link href="/" className="block mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <BrandLogo />
          </Link>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-8">
            <Link href="/carrinho" className="text-xs text-muted hover:text-ink transition-colors">Carrinho</Link>
            {STEPS.map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <svg className="h-3 w-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <button
                  type="button"
                  onClick={() => i < currentStepIndex && setStep(s)}
                  className={[
                    'text-xs transition-colors',
                    i === currentStepIndex ? 'text-ink font-semibold' :
                    i < currentStepIndex ? 'text-muted hover:text-ink cursor-pointer' :
                    'text-muted cursor-default',
                  ].join(' ')}
                >
                  {STEP_LABELS[s]}
                </button>
              </span>
            ))}
          </nav>

          <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-8">

            {/* ── STEP 1: Informações ── */}
            {step === 'informacoes' && (
              <>
                {/* Contato */}
                <section>
                  <h2 className="text-base font-medium text-ink mb-4">Contato</h2>

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
                    <CheckboxField label="Esse pedido é um presente?" checked={isGift} onChange={() => {
                      // Ao desmarcar, as embalagens de presente saem do pedido (e do total).
                      if (isGift) {
                        setGiftBag(false)
                        setGiftWrap(false)
                      }
                      setIsGift(!isGift)
                    }} />
                  </div>

                  {/* Embalagens de presente: só aparecem se o cliente marcar que o pedido é um presente */}
                  {isGift && <div className="mt-4 space-y-3">
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
                  </div>}
                </section>

                {/* Endereço */}
                <section>
                  <h2 className="text-base font-medium text-ink mb-4">Endereço de entrega</h2>
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
                          ? <svg className="h-4 w-4 animate-spin text-muted" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
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
                      <div className="relative rounded-lg border border-border-strong bg-card transition-colors focus-within:border-accent">
                        <select
                          className="w-full appearance-none px-3 py-3.5 pr-8 text-sm text-ink focus:outline-none !rounded-lg !border-0 !bg-transparent !shadow-none"
                          value={estado}
                          onChange={(e) => setEstado(e.target.value)}
                        >
                          <option value="">Estado</option>
                          {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(uf => (
                            <option key={uf}>{uf}</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
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
                <div className="border border-border rounded-lg divide-y divide-border text-sm">
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-muted w-24 flex-shrink-0">Contato</span>
                    <span className="text-ink flex-1 truncate">{email}</span>
                    <button type="button" onClick={() => setStep('informacoes')} className="text-xs text-accent hover:underline flex-shrink-0">Alterar</button>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-muted w-24 flex-shrink-0">Enviar para</span>
                    <span className="text-ink flex-1 text-xs leading-snug">
                      {[rua, numero, bairro, cep, cidade, estado, 'Brasil'].filter(Boolean).join(', ')}
                    </span>
                    <button type="button" onClick={() => setStep('informacoes')} className="text-xs text-accent hover:underline flex-shrink-0">Alterar</button>
                  </div>
                </div>

                {/* Opções de frete */}
                <div>
                  <h2 className="text-base font-medium text-ink mb-3">Forma de frete</h2>
                  <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                    {[
                      { id: 'gratis', label: 'Frete Grátis', desc: '7 a 12 dias úteis', price: 0, disabled: total < 399 },
                      { id: 'pac', label: 'PAC — Correios', desc: '5 a 8 dias úteis', price: 19.9 },
                      { id: 'sedex', label: 'SEDEX — Correios', desc: '1 a 3 dias úteis', price: 34.9 },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between px-4 py-4 cursor-pointer transition-colors ${
                          opt.disabled ? 'opacity-40 cursor-not-allowed bg-card' :
                          selectedShipping?.id === opt.id ? 'bg-bg-alt' : 'bg-card hover:bg-card-hover'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio" name="shipping" value={opt.id}
                            checked={selectedShipping?.id === opt.id}
                            disabled={opt.disabled}
                            onChange={() => !opt.disabled && setSelectedShipping({ id: opt.id, label: opt.label, price: opt.price })}
                            className="accent-[var(--accent)] w-4 h-4"
                          />
                          <div>
                            <p className="text-sm font-medium text-ink">{opt.label}</p>
                            <p className="text-xs text-muted mt-0.5">
                              {opt.disabled ? 'Disponível acima de R$ 399' : opt.desc}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-ink flex-shrink-0">
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
                <div className="border border-border rounded-lg divide-y divide-border text-sm">
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-muted w-24 flex-shrink-0">Contato</span>
                    <span className="text-ink flex-1 truncate">{email}</span>
                    <button type="button" onClick={() => setStep('informacoes')} className="text-xs text-accent hover:underline flex-shrink-0">Alterar</button>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-muted w-24 flex-shrink-0">Enviar para</span>
                    <span className="text-ink flex-1 text-xs leading-snug">
                      {[rua, numero, bairro, cep, cidade, estado, 'Brasil'].filter(Boolean).join(', ')}
                    </span>
                    <button type="button" onClick={() => setStep('informacoes')} className="text-xs text-accent hover:underline flex-shrink-0">Alterar</button>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-muted w-24 flex-shrink-0">Frete</span>
                    <span className="text-ink flex-1 text-sm">
                      {selectedShipping ? `${selectedShipping.label} · ${selectedShipping.price === 0 ? 'GRÁTIS' : formatCurrency(selectedShipping.price)}` : '—'}
                    </span>
                    <button type="button" onClick={() => setStep('frete')} className="text-xs text-accent hover:underline flex-shrink-0">Alterar</button>
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-medium text-ink">Forma de pagamento</h2>
                  <p className="mb-4 mt-0.5 text-xs text-muted">Escolha como quer pagar. O pagamento é feito na próxima página.</p>
                  <MethodPicker method={payMethod} onSelect={setPayMethod} />
                  <p className="mt-3 text-xs text-muted">
                    {payMethod === 'pix'
                      ? 'No Pix você ganha 2% de desconto e o QR Code aparece na próxima página.'
                      : 'No cartão você pode parcelar em até 6x sem juros.'}
                  </p>
                </div>

                {/* Endereço de faturamento */}
                <div>
                  <h2 className="text-base font-medium text-ink mb-1">Endereço de faturamento</h2>
                  <p className="text-xs text-muted mb-3">Selecione o endereço que corresponde ao seu método de pagamento.</p>
                  <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                    <label className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer ${useSameAddress ? 'bg-bg-alt' : 'bg-card hover:bg-card-hover'}`}>
                      <input type="radio" name="billing" checked={useSameAddress} onChange={() => setUseSameAddress(true)} className="accent-[var(--accent)] w-4 h-4" />
                      <span className="text-sm text-ink">Usar o endereço de entrega</span>
                    </label>
                    <label className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer ${!useSameAddress ? 'bg-bg-alt' : 'bg-card hover:bg-card-hover'}`}>
                      <input type="radio" name="billing" checked={!useSameAddress} onChange={() => setUseSameAddress(false)} className="accent-[var(--accent)] w-4 h-4" />
                      <span className="text-sm text-ink">Usar um endereço de faturamento diferente</span>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {/* Navegação */}
            <div className="flex items-center justify-between pt-2">
              {step === 'informacoes' ? (
                <Link href="/carrinho" className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Voltar ao carrinho
                </Link>
              ) : (
                <button type="button" onClick={handleBack} className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  {step === 'frete' ? 'Voltar para as informações' : 'Voltar para o frete'}
                </button>
              )}

              <button
                type="submit"
                disabled={items.length === 0}
                className="bg-accent text-on-accent text-sm font-medium px-8 py-3.5 hover:opacity-90 transition-colors disabled:opacity-50 rounded"
              >
                {step === 'informacoes' ? 'Continuar para frete' :
                  step === 'frete' ? 'Continuar com o pagamento' :
                  payMethod === 'pix' ? 'Continuar para o pagamento com Pix' : 'Continuar para o pagamento com cartão'}
              </button>
            </div>

            {/* Footer links */}
            <div className="pt-6 border-t border-border flex flex-wrap gap-x-4 gap-y-1">
              {['Política de reembolso', 'Frete', 'Política de privacidade', 'Termos de serviço', 'Cancelamentos', 'Contato'].map((l) => (
                <a key={l} href="#" className="text-xs text-muted hover:text-ink underline transition-colors">{l}</a>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* ── DIREITA: Resumo ── */}
      <div className="lg:w-[45%] bg-card border-l border-border lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="max-w-[400px] mr-auto px-6 pt-4 pb-10 lg:pt-14 lg:pb-14 lg:sticky lg:top-0">

          {/* Itens */}
          <div className="space-y-4 mb-6" suppressHydrationWarning>
            {!mounted || items.length === 0 ? (
              <p className="text-sm text-muted">{mounted ? 'Nenhum item no carrinho.' : ''}</p>
            ) : items.map((item) => (
              <div key={item.product.id} className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-16 bg-card-hover overflow-hidden rounded">
                    <BookImage src={item.product.images[0]} title={item.product.name} />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-on-accent">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink line-clamp-2 leading-snug">{item.product.name}</p>
                  {item.product.colors?.[0] && (
                    <p className="text-xs text-muted mt-0.5">{item.product.colors[0].name}</p>
                  )}
                </div>
                <p className="text-sm font-medium text-ink flex-shrink-0">
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
                className={`flex-1 border px-3 py-2.5 text-sm placeholder:text-muted focus:outline-none bg-card transition-colors uppercase ${couponError ? 'border-red-400' : couponSuccess ? 'border-green-500' : 'border-border-strong focus:border-accent'}`}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !coupon.trim()}
                className="border border-border-strong px-4 py-2.5 text-sm text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {couponLoading ? '...' : 'Aplicar'}
              </button>
            </div>
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-green-600 mt-1">{couponSuccess}</p>}
          </div>

          {/* Aviso */}
          <div className="flex items-start gap-2.5 bg-bg-alt border border-border p-3.5 mb-6 text-xs text-muted rounded">
            <svg className="h-4 w-4 flex-shrink-0 text-muted mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p>
              Teve problemas ao finalizar o pedido?{' '}
              <a href="#" className="underline hover:text-accent transition-colors">Reporte o problema nesse formulário</a>.
            </p>
          </div>

          {/* Totais */}
          <div className="space-y-2.5 text-sm border-t border-border pt-4" suppressHydrationWarning>
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span suppressHydrationWarning>{mounted ? formatCurrency(total) : '—'}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
            )}
            {pixDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto Pix (2%)</span>
                <span>- {formatCurrency(pixDiscount)}</span>
              </div>
            )}
            {giftBag && (
              <div className="flex justify-between text-muted">
                <span className="flex items-center gap-1">🎁 {BRAND_NAME} Gift Bag</span>
                <span>{formatCurrency(GIFT_BAG_PRICE)}</span>
              </div>
            )}
            {giftWrap && (
              <div className="flex justify-between text-muted">
                <span className="flex items-center gap-1">🎁 Embalagem Prateada</span>
                <span>{formatCurrency(GIFT_WRAP_PRICE)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span className="flex items-center gap-1">
                Frete
                {step !== 'pagamento' && (
                  <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                )}
              </span>
              {shipping === null ? (
                <span className="text-muted text-xs">Calculado na próxima etapa</span>
              ) : (
                <span suppressHydrationWarning className={shipping === 0 ? 'text-green-700 font-medium' : ''}>
                  {shipping === 0 ? 'Grátis' : formatCurrency(shipping)}
                </span>
              )}
            </div>
            <div className="flex justify-between font-bold text-ink text-base pt-3 border-t border-border">
              <span>Total</span>
              <span className="flex items-baseline gap-2">
                <span className="text-xs font-normal text-muted">BRL</span>
                <span suppressHydrationWarning>{mounted ? formatCurrency(finalTotal) : '—'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
