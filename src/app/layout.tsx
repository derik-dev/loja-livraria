import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'

// DM Sans: texto, preços e botões da loja, e também o painel /admin.
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-dm-sans',
})

// Playfair Display: títulos e logo.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
  description: 'Catálogo de livros: ficção, não ficção, clássicos e muito mais. Frete grátis acima de R$ 399.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="biblioteca"
      className={`${dmSans.variable} ${playfair.variable}`}
    >
      <body className={dmSans.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
