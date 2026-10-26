'use client'

import Link from 'next/link'
import { BRAND_NAME, BRAND_TAGLINE, FREE_SHIPPING_THRESHOLD } from '@/lib/brand'
import { SECTIONS } from '@/lib/nav'
import BrandLogo from '@/components/ui/BrandLogo'

const accountLinks = [
  { href: '/produtos', label: 'Catálogo completo' },
  { href: '/carrinho', label: 'Minha sacola' },
  { href: '/conta', label: 'Minhas compras' },
]

const promises = [
  `Frete grátis acima de R$ ${FREE_SHIPPING_THRESHOLD}`,
  '2% off no Pix',
  'Troca em 30 dias',
  'Embalagem que protege a capa',
]

const colTitle = 'text-sm font-semibold text-ink'
const colLink = 'text-sm text-muted transition-colors hover:text-ink'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-footer">
      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <BrandLogo textClassName="text-2xl" />
            <p className="mt-3 text-sm text-muted">{BRAND_TAGLINE}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Um catálogo organizado por quem gosta de livro: preço claro, estoque atualizado e entrega para todo o Brasil.
            </p>
          </div>

          <div>
            <h4 className={colTitle}>Categorias</h4>
            <ul className="mt-4 space-y-2.5">
              {SECTIONS.map((s) => (
                <li key={s.slug}><Link href={`/secao/${s.slug}`} className={colLink}>{s.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={colTitle}>Sua conta</h4>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((l) => (
                <li key={l.href}><Link href={l.href} className={colLink}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={colTitle}>Compra segura</h4>
            <ul className="mt-4 space-y-2.5">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-0.5 text-accent" aria-hidden="true">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos reservados.</p>
          <p>Pagamento via Pix</p>
        </div>
      </div>
    </footer>
  )
}
