'use client'

import Link from 'next/link'
import { BRAND_NAME, BRAND_TAGLINE, FREE_SHIPPING_THRESHOLD } from '@/lib/brand'
import { formatCurrency } from '@/lib/utils'
import { SECTIONS } from '@/lib/nav'
import BrandLogo from '@/components/ui/BrandLogo'

const accountLinks = [
  { href: '/produtos', label: 'Catálogo completo' },
  { href: '/carrinho', label: 'Meu carrinho' },
  { href: '/conta', label: 'Minhas compras' },
]

const promises = [
  `Frete grátis acima de ${formatCurrency(FREE_SHIPPING_THRESHOLD)}`,
  '2% de desconto no Pix',
  'Troca em até 30 dias',
  'Embalagem que protege a capa',
]

export default function Footer() {
  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[var(--bk-navy)] text-white">
      <button
        onClick={scrollTop}
        className="w-full bg-[var(--bk-navy-2)] py-3.5 text-center text-sm font-medium text-white/90 transition-colors hover:bg-[#244680]"
      >
        Voltar ao topo
      </button>

      <div className="mx-auto max-w-[1200px] px-6 pb-10 pt-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <BrandLogo variant="light" textClassName="text-3xl" />
            <p className="bk-italic mt-3 text-lg text-[var(--bk-gold-light)]">{BRAND_TAGLINE}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Um catálogo organizado por quem gosta de livro: cada título com preço claro, estoque atualizado e entrega para todo o Brasil.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--bk-gold-light)]">Catálogo</h4>
            <ul className="mt-4 space-y-2.5">
              {SECTIONS.map((s) => (
                <li key={s.slug}>
                  <Link href={`/secao/${s.slug}`} className="text-sm text-white/80 transition-colors hover:text-white hover:underline hover:underline-offset-4">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--bk-gold-light)]">Sua conta</h4>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/80 transition-colors hover:text-white hover:underline hover:underline-offset-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--bk-gold-light)]">Compra segura</h4>
            <ul className="mt-4 space-y-2.5">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="mt-0.5 text-[var(--bk-gold-light)]" aria-hidden="true">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-6 py-5 sm:flex-row">
          <p className="text-xs text-white/55">© {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos reservados.</p>
          <p className="text-xs text-white/55">Pagamento via Pix</p>
        </div>
      </div>
    </footer>
  )
}
