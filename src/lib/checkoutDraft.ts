'use client'

/** Dados do checkout que passam da página de informações para as páginas de pagamento (Pix e cartão). */
export interface CheckoutDraft {
  email: string
  nome: string
  sobrenome: string
  /** Endereço de entrega já formatado em uma linha. */
  address: string
  shipping: { id: string; label: string; price: number } | null
  /** Desconto do cupom em R$. */
  discount: number
  giftBag: boolean
  giftWrap: boolean
}

export const GIFT_BAG_PRICE = 9
export const GIFT_WRAP_PRICE = 13.9
export const PIX_DISCOUNT_RATE = 0.02

const KEY = 'papelada:checkout-draft'

export function saveDraft(draft: CheckoutDraft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    /* sessionStorage indisponível: a página de pagamento pede para voltar ao checkout */
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* nada a limpar */
  }
}

/** Para useSyncExternalStore: lê o rascunho como texto (estável entre renders) */
export function readDraftRaw(): string | null {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function parseDraft(raw: string | null): CheckoutDraft | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as CheckoutDraft
  } catch {
    return null
  }
}
