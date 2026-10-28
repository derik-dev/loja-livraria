'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { BRAND_NAME, BRAND_TAGLINE, FREE_SHIPPING_THRESHOLD } from '@/lib/brand'
import { SECTIONS } from '@/lib/nav'
import { siteConfig } from '@/site.config'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import BrandLogo from '@/components/ui/BrandLogo'

const accountLinks = [
  { href: '/produtos', label: 'Catálogo completo' },
  { href: '/carrinho', label: 'Minha sacola' },
  { href: '/conta', label: 'Minhas compras' },
  { href: siteConfig.links.track, label: 'Rastrear pedido' },
]

const promises = [
  `Frete grátis acima de R$ ${FREE_SHIPPING_THRESHOLD}`,
  '2% off no Pix',
  'Troca em 30 dias',
  'Embalagem que protege a capa',
]

const colTitle = 'text-sm font-semibold uppercase tracking-[0.14em] text-tan'
const colLink = 'text-base text-creme/80 transition-colors hover:text-tan'

/** Rodapé escuro. O nome da loja, gigante, é revelado conforme o scroll (sobe de dentro de uma máscara). */
export default function Footer() {
  const root = useRef<HTMLElement>(null)
  const a = siteConfig.address

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(`${MEDIA.full}, ${MEDIA.light}`, () => {
        const name = el.querySelector('[data-bigname]')
        gsap.fromTo(
          name,
          { yPercent: 100 },
          { yPercent: 0, ease: 'none', scrollTrigger: { trigger: name, start: 'top 105%', end: 'top 55%', scrub: 0.6 } },
        )
      })
    },
    { scope: root },
  )

  return (
    <footer ref={root} data-tone="dark" className="overflow-hidden bg-espresso-deep text-creme">
      <div className="container-page pb-6 pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div className="col-span-2 lg:col-span-1">
            <BrandLogo textClassName="text-2xl" />
            <p className="mt-3 text-sm text-creme/70">{BRAND_TAGLINE}</p>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-creme/80">
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
                <li key={l.label}><Link href={l.href} className={colLink}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={colTitle}>Compra segura</h4>
            <ul className="mt-4 space-y-2.5">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-2 text-base text-creme/80">
                  <span className="mt-0.5 text-tan" aria-hidden="true">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className={colTitle}>Loja física</h4>
            <address className="mt-4 text-base not-italic leading-relaxed text-creme/80">
              {a.street}, {a.district}<br />
              {a.city} - {a.state}<br />
              {a.hours}<br />
              {a.phone}
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-creme/15 pt-6 text-sm text-creme/70 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos reservados.</p>
          <p>Pagamento via Pix</p>
        </div>

        {/* Nome gigante, revelado pelo scroll */}
        <div className="mt-8 overflow-hidden" aria-hidden="true">
          <p data-bigname className="font-display select-none text-center text-[clamp(4.5rem,21vw,19rem)] leading-[0.85] tracking-[0.02em] text-tan">
            {BRAND_NAME.toUpperCase()}
          </p>
        </div>
      </div>
    </footer>
  )
}
