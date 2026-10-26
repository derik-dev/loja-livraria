import type { Metadata } from 'next'
import { DM_Sans, Poppins } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'

// DM Sans: texto, preços e botões da loja, e também o painel /admin.
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-dm-sans',
})

// Poppins: títulos e logo.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
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
      className={`${dmSans.variable} ${poppins.variable}`}
    >
      <body className={dmSans.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
