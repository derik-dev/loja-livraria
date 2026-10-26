import type { Metadata } from 'next'
import { DM_Sans, Bodoni_Moda, Jost } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'
import { THEME, isFeminino } from '@/lib/theme'
import { BRAND_NAME } from '@/lib/brand'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] })

// Fontes do tema "feminino" (expostas como variáveis CSS; o tema default não as usa)
const bodoni = Bodoni_Moda({ subsets: ['latin'], variable: '--font-display', axes: ['opsz'] })
const jost = Jost({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: isFeminino ? BRAND_NAME : 'Loja Virtual',
  description: 'O melhor e-commerce para você',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme={THEME} className={`${bodoni.variable} ${jost.variable}`}>
      <body className={dmSans.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
