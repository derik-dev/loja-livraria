'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { BRAND_NAME } from '@/lib/brand'
import { placeOrder } from '@/lib/orders'
import { GIFT_BAG_PRICE, GIFT_WRAP_PRICE, PIX_DISCOUNT_RATE, clearDraft, parseDraft, readDraftRaw } from '@/lib/checkoutDraft'
import BrandLogo from '@/components/ui/BrandLogo'
import { BookImage } from '@/components/zine'
import { CardPanel, PixPanel, SimulationNote, type PayMethod, type PaymentFields } from './PaymentSimulator'

const noop = () => () => {}

/**
 * Página de pagamento SIMULADO (uma para o Pix e outra para o cartão). Lê o rascunho salvo pelo checkout
 * (e-mail, endereço, frete, cupom e presentes) e o carrinho; aceita qualquer valor e cria o pedido.
 */
export default function PaymentPage({ method }: { method: PayMethod }) {
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.total())
  const clearCart = useCartStore((s) => s.clearCart)
  const { user } = useAuth()

  const mounted = useSyncExternalStore(noop, () => true, () => false)
  const raw = useSyncExternalStore(noop, readDraftRaw, () => null)
  const draft = useMemo(() => parseDraft(raw), [raw])

  const [cpf, setCpf] = useState('')
  const [pay, setPay] = useState({ pixName: null as string | null, pixEmail: null as string | null, cardNumber: '', cardName: '', cardExp: '', cardCvv: '', installments: 1 })
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const isPix = method === 'pix'
  const goods = Math.max(0, subtotal - (draft?.discount ?? 0))
  const gift = (draft?.giftBag ? GIFT_BAG_PRICE : 0) + (draft?.giftWrap ? GIFT_WRAP_PRICE : 0)
  const shipping = draft?.shipping?.price ?? 0
  const cardTotal = goods + shipping + gift
  const pixDiscount = isPix ? Math.round(goods * PIX_DISCOUNT_RATE * 100) / 100 : 0
  const finalTotal = cardTotal - pixDiscount

  const fullName = `${draft?.nome ?? ''} ${draft?.sobrenome ?? ''}`.trim()
  const value: PaymentFields = {
    method,
    cpf,
    pixName: pay.pixName ?? fullName,
    pixEmail: pay.pixEmail ?? draft?.email ?? '',
    cardNumber: pay.cardNumber,
    cardName: pay.cardName,
    cardExp: pay.cardExp,
    cardCvv: pay.cardCvv,
    installments: pay.installments,
  }

  const onChange = (patch: Partial<PaymentFields>) => {
    if (patch.cpf !== undefined) setCpf(patch.cpf)
    const { cpf: _cpf, method: _method, ...rest } = patch
    void _cpf
    void _method
    setPay((p) => ({ ...p, ...rest }))
    setError('')
  }

  async function handlePay() {
    const blank = (v: string) => v.trim().length === 0
    if (isPix) {
      if (blank(value.pixName) || blank(cpf) || blank(value.pixEmail)) {
        setError('Preencha nome, CPF e e-mail para continuar com o Pix.')
        return
      }
    } else if (blank(pay.cardNumber) || blank(pay.cardName) || blank(pay.cardExp) || blank(pay.cardCvv) || blank(cpf)) {
      setError('Preencha todos os dados do cartão para continuar.')
      return
    }

    setError('')
    setProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1800))
    await placeOrder({ items, total: finalTotal, user, email: draft?.email ?? value.pixEmail, shippingId: draft?.shipping?.id })
    clearCart()
    clearDraft()
    setDone(true)
    setProcessing(false)
  }

  if (!mounted) return <div data-tone="light" className="min-h-screen bg-bg" />

  if (done) {
    return (
      <div data-tone="light" className="flex min-h-screen items-center justify-center bg-bg">
        <div className="surface mx-4 w-full max-w-md p-12 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-accent">
            <svg className="h-6 w-6 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="mb-3 text-lg font-semibold text-ink">Pedido confirmado!</h1>
          <p className="mb-1 text-sm text-muted">Seu pedido foi recebido com sucesso.</p>
          <p className="mb-1 text-xs text-muted">Pagamento simulado via {isPix ? 'Pix' : 'cartão'}: nenhuma cobrança real foi feita.</p>
          <p className="mb-8 text-xs text-muted">Você receberá um e-mail com os detalhes e o código de rastreio em breve.</p>
          <Link href="/" className="btn-primary">Voltar para a loja</Link>
        </div>
      </div>
    )
  }

  if (!draft || items.length === 0) {
    return (
      <div data-tone="light" className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="surface w-full max-w-md p-10 text-center">
          <h1 className="text-xl font-semibold text-ink">Não há uma compra em andamento</h1>
          <p className="mt-2 text-sm text-muted">Volte ao checkout para informar o endereço, escolher o frete e a forma de pagamento.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/checkout" className="btn-primary">Ir para o checkout</Link>
            <Link href="/carrinho" className="btn-outline">Ver a sacola</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-tone="light" className="flex min-h-screen flex-col bg-bg lg:flex-row">
      {/* ── Pagamento ── */}
      <div className="flex-1">
        <div className="ml-auto max-w-[560px] px-6 py-10 lg:py-14">
          <Link href="/" className="mb-8 block"><BrandLogo /></Link>

          <nav aria-label="Etapas" className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <Link href="/carrinho" className="hover:text-accent">Carrinho</Link>
            <span aria-hidden="true">›</span>
            <Link href="/checkout" className="hover:text-accent">Informações e frete</Link>
            <span aria-hidden="true">›</span>
            <span className="font-semibold text-ink">{isPix ? 'Pagamento com Pix' : 'Pagamento com cartão'}</span>
          </nav>

          <div className="mb-6 rounded-lg border border-border divide-y divide-border text-sm">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="w-24 flex-shrink-0 text-muted">Contato</span>
              <span className="flex-1 truncate text-ink">{draft.email}</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="w-24 flex-shrink-0 text-muted">Enviar para</span>
              <span className="flex-1 text-xs leading-snug text-ink">{draft.address}</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="w-24 flex-shrink-0 text-muted">Frete</span>
              <span className="flex-1 text-ink">{draft.shipping ? `${draft.shipping.label} · ${draft.shipping.price === 0 ? 'GRÁTIS' : formatCurrency(draft.shipping.price)}` : '—'}</span>
            </div>
          </div>

          <h1 className="text-xl font-medium text-ink">{isPix ? 'Pagar com Pix' : 'Pagar com cartão de crédito'}</h1>
          <p className="mb-4 mt-0.5 text-xs text-muted">Todas as transações são seguras e criptografadas.</p>
          <SimulationNote />

          {isPix ? (
            <PixPanel
              value={value}
              onChange={onChange}
              total={cardTotal}
              pixTotal={finalTotal}
              error={error}
              processing={processing}
              onSimulate={handlePay}
            />
          ) : (
            <>
              <CardPanel value={value} onChange={onChange} total={cardTotal} pixTotal={finalTotal} error={error} />
              <button type="button" onClick={handlePay} disabled={processing} className="btn-primary mt-6 w-full !min-h-[54px]">
                {processing ? 'Processando…' : `Pagar ${formatCurrency(finalTotal)}`}
              </button>
            </>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Link href="/checkout" className="text-sm text-muted transition-colors hover:text-accent">‹ Trocar forma de pagamento</Link>
          </div>
        </div>
      </div>

      {/* ── Resumo ── */}
      <aside className="border-l border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:w-[45%] lg:overflow-y-auto">
        <div className="max-w-[460px] px-6 py-10 lg:py-14">
          <h2 className="mb-5 text-base font-medium text-ink">Resumo do pedido</h2>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.product.id} className="flex items-center gap-4">
                <span className="relative block aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-sm bg-card-hover ring-1 ring-border">
                  <BookImage src={item.product.images[0]} title={item.product.name} sizes="56px" />
                  <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-bl bg-accent px-1 text-[10px] font-bold text-on-accent">{item.quantity}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-sm font-medium text-ink">{item.product.name}</span>
                  {item.product.author && <span className="block truncate text-xs text-muted">{item.product.author}</span>}
                </span>
                <span className="shrink-0 text-sm font-medium text-ink">{formatCurrency(item.product.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
            {draft.discount > 0 && <div className="flex justify-between text-green-600"><dt>Desconto</dt><dd>- {formatCurrency(draft.discount)}</dd></div>}
            {draft.giftBag && <div className="flex justify-between text-muted"><dt>{BRAND_NAME} Gift Bag</dt><dd>{formatCurrency(GIFT_BAG_PRICE)}</dd></div>}
            {draft.giftWrap && <div className="flex justify-between text-muted"><dt>Embalagem Prateada</dt><dd>{formatCurrency(GIFT_WRAP_PRICE)}</dd></div>}
            {pixDiscount > 0 && <div className="flex justify-between text-green-600"><dt>Desconto Pix (2%)</dt><dd>- {formatCurrency(pixDiscount)}</dd></div>}
            <div className="flex justify-between text-muted"><dt>Frete</dt><dd>{shipping === 0 ? 'Grátis' : formatCurrency(shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-ink">
              <dt>Total</dt>
              <dd className="flex items-baseline gap-2"><span className="text-xs font-normal text-muted">BRL</span>{formatCurrency(finalTotal)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  )
}
