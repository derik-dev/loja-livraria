import type { Metadata } from 'next'
import { DM_Sans, Poppins, Cinzel, Caveat } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'
import { siteConfig } from '@/site.config'

// DM Sans: texto, preços e botões da loja, e também o painel /admin.
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-dm-sans',
})

// Instrument Serif: títulos (só existe no peso 400, por isso os títulos não usam negrito).
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cinzel',
})

// Caveat: assinaturas manuscritas dos depoimentos.
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-caveat',
})

// Poppins: apoio (rótulos e detalhes).
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
  description: `${siteConfig.description} Frete grátis acima de R$ ${siteConfig.freeShippingThreshold}.`,
}

// Cores da marca vindas de site.config.ts viram os tokens do Tailwind (ver @theme em themes/biblioteca.css).
const themeColors = {
  '--color-espresso': siteConfig.colors.espresso,
  '--color-espresso-deep': siteConfig.colors.espressoDeep,
  '--color-creme': siteConfig.colors.creme,
  '--color-creme-card': siteConfig.colors.cremeCard,
  '--color-tan': siteConfig.colors.tan,
  '--color-marrom-medio': siteConfig.colors.marromMedio,
  '--color-vinho': siteConfig.colors.vinho,
} as React.CSSProperties

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="biblioteca"
      className={`${dmSans.variable} ${poppins.variable} ${cinzel.variable} ${caveat.variable}`}
      style={themeColors}
    >
      <body className={dmSans.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
