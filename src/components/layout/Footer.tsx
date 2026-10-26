'use client'

import Link from 'next/link'
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'
import { SECTIONS } from '@/lib/nav'
import BrandLogo from '@/components/ui/BrandLogo'

const accountLinks = [
  { href: '/produtos', label: 'Catálogo completo' },
  { href: '/carrinho', label: 'Meu carrinho' },
  { href: '/conta', label: 'Minha conta e pedidos' },
]

const promises = [
  'Frete grátis acima de R$ 399',
  '2% de desconto no Pix',
  'Troca em até 30 dias',
  'Embalagem que protege a capa',
]

export default function Footer() {
  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="mt-24 bg-[var(--bk-green)] text-[var(--bk-card)]">
      <div className="border-t-[6px] border-double border-[var(--bk-gold)]" />

      <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-14 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <BrandLogo variant="light" textClassName="text-3xl" />
            <p className="bk-italic mt-2 text-lg text-[var(--bk-gold-light)]">{BRAND_TAGLINE}</p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[var(--bk-card)]/75">
              Um catálogo organizado por quem gosta de livro: cada título com preço claro, estoque atualizado e entrega para todo o Brasil.
            </p>
          </div>

          <div>
            <h4 className="bk-eyebrow !text-[var(--bk-gold-light)]">Catálogo</h4>
            <ul className="mt-4 space-y-2.5">
              {SECTIONS.map((s) => (
                <li key={s.slug}>
                  <Link href={`/secao/${s.slug}`} className="text-sm hover:text-[var(--bk-gold-light)] hover:underline hover:underline-offset-4">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="bk-eyebrow !text-[var(--bk-gold-light)]">Sua conta</h4>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-[var(--bk-gold-light)] hover:underline hover:underline-offset-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="bk-eyebrow !text-[var(--bk-gold-light)]">Compra segura</h4>
            <ul className="mt-4 space-y-2.5">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-[10px] text-[var(--bk-gold-light)]" aria-hidden="true">✦</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--bk-gold)]/40">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row sm:px-10 lg:px-16">
          <p className="text-xs text-[var(--bk-card)]/60">© {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos reservados.</p>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--bk-card)]/60">Pagamento via Pix</p>
          <button onClick={scrollTop} className="text-xs uppercase tracking-[0.18em] text-[var(--bk-gold-light)] hover:underline hover:underline-offset-4">
            Voltar ao topo ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
