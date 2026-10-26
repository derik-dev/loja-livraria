import Link from 'next/link'
import { BRAND_NAME } from '@/lib/brand'

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
const whatsappHref = `https://wa.me/${whatsappNumber ?? ''}`

const shopLinks = [
  { href: '/secao/novidades', label: 'Novidades' },
  { href: '/secao/feminino', label: 'Feminino' },
  { href: '/secao/acessorios', label: 'Acessórios' },
  { href: '/produtos', label: 'Todos os produtos' },
]

const helpLinks = [
  { href: '/troca-devolucao', label: 'Trocas e devoluções' },
  { href: '/encontre-seu-tamanho', label: 'Encontre seu tamanho' },
  { href: '/faq', label: 'Perguntas frequentes' },
  { href: '/privacidade', label: 'Privacidade' },
]

const social = [
  {
    label: 'Instagram',
    href: '#',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    label: 'Pinterest',
    href: '#',
    path: 'M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z',
  },
  {
    label: 'WhatsApp',
    href: whatsappHref,
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  },
]

export default function FooterFeminino() {
  return (
    <footer className="fem-dark overflow-hidden bg-[var(--theme-night)] text-[var(--theme-accent-ink)]">
      <div className="mx-auto grid max-w-[90rem] gap-14 px-6 pb-16 pt-24 sm:px-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-16">
        <div>
          <p className="fem-display max-w-sm text-4xl sm:text-5xl">Feita para quem decide.</p>
          <p className="mt-6 max-w-xs leading-relaxed text-[var(--theme-soft-2)]">
            Peças de presença, pensadas para o seu dia inteiro.
          </p>
        </div>

        <nav aria-label="Loja">
          <h2 className="fem-caps mb-6 text-[var(--theme-blush)]">Loja</h2>
          <ul className="space-y-3.5">
            {shopLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="fem-link">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Ajuda">
          <h2 className="fem-caps mb-6 text-[var(--theme-blush)]">Ajuda</h2>
          <ul className="space-y-3.5">
            {helpLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="fem-link">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="fem-caps mb-6 text-[var(--theme-blush)]">Siga</h2>
          <ul className="flex items-center gap-3">
            {social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center border border-[var(--theme-blush)]/50 text-[var(--theme-accent-ink)] transition-colors duration-300 hover:border-[var(--theme-blush)] hover:bg-[var(--theme-blush)] hover:text-[var(--theme-night)]"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d={s.path} /></svg>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[var(--theme-soft-2)]">Atendimento pelo WhatsApp, todos os dias.</p>
        </div>
      </div>

      <p
        className="fem-display select-none whitespace-nowrap px-6 text-center text-[clamp(3.2rem,17vw,15rem)] uppercase leading-[0.85] tracking-[0.04em] text-[var(--theme-blush)]/90 sm:px-10"
        aria-hidden="true"
      >
        {BRAND_NAME}
      </p>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-[var(--theme-soft-2)] sm:flex-row sm:px-10 lg:px-16">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos reservados.</p>
          <p>Pix · Cartão de crédito · Boleto</p>
        </div>
      </div>
    </footer>
  )
}
