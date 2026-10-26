'use client'

import { type ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import AuthModal from '@/components/auth/AuthModal'

function AuthModalWrapper() {
  const { authModalOpen } = useAuth()
  if (!authModalOpen) return null
  return <AuthModal />
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AuthModalWrapper />
    </AuthProvider>
  )
}
