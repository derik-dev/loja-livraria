'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BrandLogo from '@/components/ui/BrandLogo'
import { BRAND_NAME } from '@/lib/brand'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'login' | 'signup'>(searchParams.get('tab') === 'signup' ? 'signup' : 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const requestedReturnTo = searchParams.get('returnTo') ?? '/conta'
  const returnTo = requestedReturnTo.startsWith('/') && !requestedReturnTo.startsWith('//') ? requestedReturnTo : '/conta'

  useEffect(() => {
    if (!success) return
    const timeout = window.setTimeout(() => router.replace(returnTo), 2000)
    return () => window.clearTimeout(timeout)
  }, [success, returnTo, router])

  function switchTab(t: 'login' | 'signup') {
    setTab(t)
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (tab === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(traducirErro(error))
      else router.replace(returnTo)
    } else {
      const { error } = await signUp(email, password, name)
      if (error) setError(traducirErro(error))
      else setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <main data-tone="dark" className="hero-glow relative flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12 text-ink">
      {/* Fechar — canto superior direito */}
      <Link
        href="/"
        className="absolute right-5 top-5 p-2 text-muted transition-colors hover:text-ink"
        aria-label="Voltar para a loja"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Link>

      {/* Logo */}
      <div className="mb-8"><BrandLogo className="h-8 w-auto object-contain" textClassName="text-xl" /></div>

      {/* Card */}
      <div className="surface w-full max-w-md p-8">

        {success ? (
          <div className="text-center py-4">
            <h2 className="mb-2 text-xl font-semibold text-ink">Conta criada!</h2>
            <p className="mb-6 text-sm leading-relaxed text-muted">
              Verifique seu e-mail para confirmar o cadastro.
            </p>
            <Link href={returnTo} className="text-sm font-semibold text-accent underline underline-offset-4">
              Voltar à página anterior
            </Link>
          </div>
        ) : (
          <>
            {/* Título */}
            <h2 className="mb-1 text-center text-xl font-semibold text-ink">
              {tab === 'login' ? 'Fazer login' : 'Criar conta'}
            </h2>
            <p className="mb-6 text-center text-sm text-muted">
              {tab === 'login' ? 'Entra aí e continua a leitura' : 'Preencha os dados abaixo'}
            </p>


            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label className="mb-1.5 block text-sm text-muted">Nome</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full rounded-full border border-border-strong bg-card px-4 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm text-muted">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-full border border-border-strong bg-card px-4 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-muted">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-full border border-border-strong bg-card px-4 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
                />
              </div>

              {error && <p className="text-xs text-[#ff9a82]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? '...' : 'Continuar'}
              </button>
            </form>

            {/* Switch tab */}
            <p className="mt-5 text-center text-sm text-muted">
              {tab === 'login' ? (
                <>Não tem conta?{' '}
                  <button onClick={() => switchTab('signup')} className="font-semibold text-accent underline underline-offset-2">
                    Cadastre-se
                  </button>
                </>
              ) : (
                <>Já tem conta?{' '}
                  <button onClick={() => switchTab('login')} className="font-semibold text-accent underline underline-offset-2">
                    Entrar
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted">© {BRAND_NAME}</p>
    </main>
  )
}

function traducirErro(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.'
  if (msg.includes('Password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.'
  if (msg.includes('Unable to validate email address')) return 'E-mail inválido.'
  return msg
}
