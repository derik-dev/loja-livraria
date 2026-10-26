'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/brand'
import { formatCurrency } from '@/lib/utils'

const ICON = 'h-12 w-12 text-[var(--bk-navy)]'
const icons = {
  truck: (
    <svg className={ICON} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h24v20H4zM28 20h8l8 8v4H28z" /><circle cx="14" cy="35" r="4" fill="var(--bk-gold-light)" /><circle cx="36" cy="35" r="4" fill="var(--bk-gold-light)" />
    </svg>
  ),
  user: (
    <svg className={ICON} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="8" width="36" height="32" rx="3" /><circle cx="24" cy="21" r="6" fill="var(--bk-gold-light)" /><path d="M13 36c1.5-6 6-8 11-8s9.500 2 11 8" />
    </svg>
  ),
  pix: (
    <svg className={ICON} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="12" width="38" height="26" rx="3" /><path d="M5 20h38" /><rect x="10" y="27" width="10" height="5" rx="1" fill="var(--bk-gold-light)" />
    </svg>
  ),
  star: (
    <svg className={ICON} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 6l5.500 11.500 12.500 1.600-9.200 8.700 2.400 12.400L24 34l-11.200 6.200 2.400-12.400L6 19.100l12.500-1.600z" fill="var(--bk-gold-light)" />
    </svg>
  ),
  shield: (
    <svg className={ICON} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 5l15 6v11c0 10-6.500 17-15 21C15.500 39 9 32 9 22V11z" fill="var(--bk-gold-light)" /><path d="M17 24l5 5 9-10" />
    </svg>
  ),
  book: (
    <svg className={ICON} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 12c-4-3-9-4-15-3v26c6-1 11 0 15 3 4-3 9-4 15-3V9c-6-1-11 0-15 3zM24 12v26" fill="var(--bk-gold-light)" />
    </svg>
  ),
}

export default function ShortcutCards() {
  const { user, openAuthModal } = useAuth()

  const cards = [
    { title: 'Frete grátis', text: `Em compras acima de ${formatCurrency(FREE_SHIPPING_THRESHOLD)}.`, icon: icons.truck, action: { label: 'Ver livros', href: '/produtos' } },
    user
      ? { title: 'Minhas compras', text: 'Acompanhe seus pedidos e dados.', icon: icons.user, action: { label: 'Ir para minha conta', href: '/conta' } }
      : { title: 'Entre na sua conta', text: 'Compre mais rápido e acompanhe seus pedidos.', icon: icons.user, action: { label: 'Entrar na sua conta', onClick: openAuthModal } },
    { title: 'Meios de pagamento', text: 'Pague com Pix e ganhe 2% de desconto.', icon: icons.pix, action: { label: 'Tire suas dúvidas', href: '#duvidas' } },
    { title: 'Mais procurados', text: 'Os livros que mais saem da estante.', icon: icons.star, action: { label: 'Ver mais procurados', href: '#mais-procurados' } },
    { title: 'Troca garantida', text: 'Até 30 dias para trocar, sem burocracia.', icon: icons.shield, action: { label: 'Como funciona', href: '#duvidas' } },
    { title: 'Novidades', text: 'Livros que acabaram de chegar.', icon: icons.book, action: { label: 'Ver novidades', href: '/secao/novidades' } },
  ]

  const btn = 'mt-auto block w-full rounded-md bg-[var(--bk-gold-pale)] px-3 py-2.5 text-center text-[13px] font-semibold text-[var(--bk-navy)] transition-colors hover:bg-[#efe0b4]'

  return (
    <section className="relative z-10 -mt-24 px-4 sm:px-6" aria-label="Atalhos">
      <div className="bk-noscroll mx-auto flex max-w-[1200px] snap-x gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-6 lg:overflow-visible">
        {cards.map((c) => (
          <div key={c.title} className="bk-card flex min-h-[250px] w-[200px] flex-shrink-0 snap-start flex-col p-5 lg:w-auto">
            <h2 className="z-plain text-[17px] font-semibold leading-tight text-[var(--bk-ink)]">{c.title}</h2>
            <div className="my-4 flex justify-center">{c.icon}</div>
            <p className="mb-4 text-center text-[13px] leading-snug text-[var(--bk-ink-soft)]">{c.text}</p>
            {'href' in c.action ? (
              <Link href={c.action.href!} className={btn}>{c.action.label}</Link>
            ) : (
              <button onClick={c.action.onClick} className={btn}>{c.action.label}</button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
