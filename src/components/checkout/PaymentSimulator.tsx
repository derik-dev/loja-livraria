'use client'

import { useMemo, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

export type PayMethod = 'pix' | 'card'

export interface PaymentFields {
  method: PayMethod
  pixName: string
  pixEmail: string
  cpf: string
  cardNumber: string
  cardName: string
  cardExp: string
  cardCvv: string
  installments: number
}

interface PanelProps {
  value: PaymentFields
  onChange: (patch: Partial<PaymentFields>) => void
  /** Total no cartão (sem desconto Pix). */
  total: number
  /** Total no Pix (com 2% de desconto). */
  pixTotal: number
  error?: string
  /** Botão "Simular pagamento": dispara a confirmação do pagamento. */
  onSimulate?: () => void
  processing?: boolean
}

const input =
  'w-full rounded-lg border border-border-strong bg-card px-3 py-3.5 text-sm text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none'

// ── Máscaras ──────────────────────────────────────────────
const digits = (v: string) => v.replace(/\D/g, '')
const maskCpf = (v: string) => {
  const d = digits(v).slice(0, 11)
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
const maskCard = (v: string) => digits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
const maskExp = (v: string) => {
  const d = digits(v).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

// ── QR Code de mentira (só ilustração: não leva a pagamento nenhum) ──
function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

function FakeQr({ seed }: { seed: string }) {
  const N = 29
  const cells = useMemo(() => {
    const rng = { s: hash(seed) || 1 }
    const rand = () => {
      rng.s ^= rng.s << 13
      rng.s ^= rng.s >>> 17
      rng.s ^= rng.s << 5
      return ((rng.s >>> 0) % 1000) / 1000
    }
    const grid: boolean[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => rand() > 0.52))
    const finder = (ox: number, oy: number) => {
      for (let y = -1; y <= 7; y++)
        for (let x = -1; x <= 7; x++) {
          const gx = ox + x
          const gy = oy + y
          if (gx < 0 || gy < 0 || gx >= N || gy >= N) continue
          const ring = x === 0 || x === 6 || y === 0 || y === 6
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
          grid[gy][gx] = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (ring || core)
        }
    }
    finder(0, 0)
    finder(N - 7, 0)
    finder(0, N - 7)
    return grid
  }, [seed])

  return (
    <svg viewBox={`0 0 ${N} ${N}`} className="h-full w-full" shapeRendering="crispEdges" role="img" aria-label="QR Code Pix de demonstração">
      <rect width={N} height={N} fill="#ffffff" />
      {cells.flatMap((row, y) => row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#000000" /> : null)))}
    </svg>
  )
}

function Radio({ checked, label, hint, onSelect, icon }: { checked: boolean; label: string; hint: string; onSelect: () => void; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition-colors ${checked ? 'border-2 border-accent bg-card' : 'border-border-strong bg-card hover:border-accent'}`}
    >
      <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-accent' : 'border-border-strong'}`}>
        {checked && <span className="h-2 w-2 rounded-full bg-accent" />}
      </span>
      <span className="text-accent">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
    </button>
  )
}

/** Escolha da forma de pagamento (Pix ou cartão). Cada uma tem a própria página. */
export function MethodPicker({ method, onSelect }: { method: PayMethod; onSelect: (m: PayMethod) => void }) {
  return (
    <div role="radiogroup" aria-label="Forma de pagamento" className="grid gap-2.5 sm:grid-cols-2">
      <Radio
        checked={method === 'pix'}
        onSelect={() => onSelect('pix')}
        label="Pix"
        hint="2% de desconto, aprovação na hora"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l4.5 4.5L12 12 7.5 7.5 12 3zm0 9l4.5 4.5L12 21l-4.5-4.5L12 12z" /></svg>}
      />
      <Radio
        checked={method === 'card'}
        onSelect={() => onSelect('card')}
        label="Cartão de crédito"
        hint="Em até 6x sem juros"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 16.5v-9zM3 10h18M6.5 14.5h4" /></svg>}
      />
    </div>
  )
}

/** Aviso de que nada aqui cobra de verdade. */
export function SimulationNote() {
  return (
    <p role="note" className="mb-4 flex items-start gap-2 rounded-lg border border-accent/40 bg-bg-alt px-4 py-3 text-xs leading-snug text-ink">
      <span aria-hidden="true">ⓘ</span>
      <span><strong>Ambiente de simulação.</strong> Nenhum pagamento real é feito: preencha qualquer valor nos campos e clique em pagar.</span>
    </p>
  )
}

/** Pagamento SIMULADO com Pix: nome, CPF e e-mail + QR Code (de mentira) e copia e cola. */
export function PixPanel({ value, onChange, total, pixTotal, error, onSimulate, processing = false }: PanelProps) {
  const [copied, setCopied] = useState(false)
  const pixCode = useMemo(
    () => `00020126360014BR.GOV.BCB.PIX0114papelada-demo5204000053039865406${pixTotal.toFixed(2).replace('.', '')}5802BR5909PAPELADA6009SAO PAULO62070503***6304SIM0`,
    [pixTotal],
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* sem permissão para copiar: o código continua visível para copiar à mão */
    }
  }

  return (
    <div>
      <div className="space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <input className={input} placeholder="Nome completo" aria-label="Nome completo" autoComplete="name" value={value.pixName} onChange={(e) => onChange({ pixName: e.target.value })} />
            <input className={input} placeholder="CPF" aria-label="CPF" inputMode="numeric" autoComplete="off" value={value.cpf} onChange={(e) => onChange({ cpf: maskCpf(e.target.value) })} />
          </div>
          <input className={input} type="email" placeholder="E-mail" aria-label="E-mail" autoComplete="email" value={value.pixEmail} onChange={(e) => onChange({ pixEmail: e.target.value })} />

          <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start">
            <div className="h-[168px] w-[168px] flex-shrink-0 rounded-lg bg-[#ffffff] p-2 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)]">
              <FakeQr seed={pixCode} />
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-xs text-muted">Valor no Pix</p>
              <p className="text-2xl font-semibold text-ink">{formatCurrency(pixTotal)}</p>
              {pixTotal < total && <p className="text-xs text-accent">Você economiza {formatCurrency(total - pixTotal)} pagando no Pix</p>}
              <p className="mt-3 text-xs leading-relaxed text-muted">Abra o app do seu banco, escolha pagar com Pix e escaneie o QR Code. Nesta simulação, basta clicar em &quot;Simular pagamento do Pix&quot;.</p>
              <label className="mt-3 block text-xs font-medium text-ink" htmlFor="pix-code">Pix copia e cola</label>
              <div className="mt-1 flex gap-2">
                <input id="pix-code" readOnly value={pixCode} className={`${input} !py-2 font-mono !text-xs`} onFocus={(e) => e.currentTarget.select()} />
                <button type="button" onClick={copy} className="btn-outline !min-h-[40px] flex-shrink-0 !px-4 !py-2 !text-xs">{copied ? 'Copiado!' : 'Copiar'}</button>
              </div>

              {/* O que acontece num Pix de verdade: aguarda o pagamento e confirma na hora */}
              <p role="status" className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-ink sm:justify-start">
                <span className={`h-2 w-2 rounded-full bg-accent ${processing ? '' : 'animate-pulse'}`} aria-hidden="true" />
                {processing ? 'Pagamento recebido, confirmando…' : 'Aguardando o pagamento'}
              </p>
              {onSimulate && (
                <button type="button" onClick={onSimulate} disabled={processing} className="btn-primary mt-3 w-full !min-h-[46px] !text-sm sm:w-auto">
                  {processing ? 'Confirmando…' : 'Simular pagamento do Pix'}
                </button>
              )}
            </div>
          </div>
        </div>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-[#c0392b]">{error}</p>}
    </div>
  )
}

/** Pagamento SIMULADO com cartão: dados padrão (número, nome, validade, CVV, CPF e parcelas). */
export function CardPanel({ value, onChange, total, error }: PanelProps) {
  const brand = value.cardNumber.startsWith('4') ? 'Visa' : /^5[1-5]|^2[2-7]/.test(value.cardNumber) ? 'Mastercard' : value.cardNumber.startsWith('3') ? 'Amex' : 'Cartão'
  const previewNumber = (value.cardNumber + '•••• •••• •••• ••••').replace(/\s/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ')

  return (
    <div>
      <div className="space-y-3">
          {/* Prévia do cartão */}
          <div className="mx-auto flex h-[170px] w-full max-w-[300px] flex-col justify-between rounded-2xl bg-marrom-medio p-5 text-creme shadow-[0_18px_36px_-16px_rgb(0_0_0/0.6)]" aria-hidden="true">
            <div className="flex items-center justify-between">
              <span className="h-7 w-10 rounded-md bg-tan/80" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-creme">{brand}</span>
            </div>
            <p className="font-mono text-lg tracking-[0.12em]">{previewNumber}</p>
            <div className="flex items-end justify-between text-xs">
              <span className="max-w-[170px] truncate uppercase">{value.cardName || 'Nome no cartão'}</span>
              <span>{value.cardExp || 'MM/AA'}</span>
            </div>
          </div>

          <input className={input} placeholder="Número do cartão" aria-label="Número do cartão" inputMode="numeric" autoComplete="cc-number" value={value.cardNumber} onChange={(e) => onChange({ cardNumber: maskCard(e.target.value) })} />
          <input className={input} placeholder="Nome impresso no cartão" aria-label="Nome impresso no cartão" autoComplete="cc-name" value={value.cardName} onChange={(e) => onChange({ cardName: e.target.value })} />
          <div className="grid grid-cols-2 gap-2.5">
            <input className={input} placeholder="Validade (MM/AA)" aria-label="Validade" inputMode="numeric" autoComplete="cc-exp" value={value.cardExp} onChange={(e) => onChange({ cardExp: maskExp(e.target.value) })} />
            <input className={input} placeholder="CVV" aria-label="Código de segurança (CVV)" inputMode="numeric" autoComplete="cc-csc" value={value.cardCvv} onChange={(e) => onChange({ cardCvv: digits(e.target.value).slice(0, 4) })} />
          </div>
          <input className={input} placeholder="CPF do titular" aria-label="CPF do titular" inputMode="numeric" autoComplete="off" value={value.cpf} onChange={(e) => onChange({ cpf: maskCpf(e.target.value) })} />
          <div className="relative">
            <select
              aria-label="Parcelas"
              value={value.installments}
              onChange={(e) => onChange({ installments: Number(e.target.value) })}
              className={`${input} appearance-none pr-10`}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}x de {formatCurrency(total / n)} {n === 1 ? 'à vista' : 'sem juros'}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
          </div>
        </div>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-[#c0392b]">{error}</p>}
    </div>
  )
}
