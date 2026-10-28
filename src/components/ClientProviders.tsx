'use client'

import { type ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import CustomCursor from '@/components/ui/CustomCursor'
import Preloader from '@/components/ui/Preloader'
import SmoothScroll from '@/components/providers/SmoothScroll'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Preloader />
      <SmoothScroll>{children}</SmoothScroll>
      <CustomCursor />
    </AuthProvider>
  )
}
