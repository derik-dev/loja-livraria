'use client'

import { usePathname } from 'next/navigation'
import { Header, Footer } from '@/components/layout'
import { CartDrawer } from '@/components/cart'
import ChatAssistant from '@/components/ui/ChatAssistant'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAccountPage = pathname === '/conta'
  const isCheckoutPage = pathname === '/checkout'
  const hideChrome = isAccountPage || isCheckoutPage

  return (
    <>
      {!hideChrome && <Header />}
      <main className="min-h-screen">{children}</main>
      {!hideChrome && <Footer />}
      {!hideChrome && <CartDrawer />}
      <ChatAssistant />
    </>
  )
}
