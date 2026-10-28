import { Suspense } from 'react'
import AuthPage from '@/components/auth/AuthPage'

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-bg text-muted">Carregando...</main>}>
      <AuthPage />
    </Suspense>
  )
}
