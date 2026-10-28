'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BrandLogo from '@/components/ui/BrandLogo'
import { BRAND_NAME } from '@/lib/brand'

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'login' | 'signup'>(searchParams.get('tab') === 'signup' ? 'signup' : 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const requestedReturnTo = searchParams.get('returnTo') ?? '/conta'
  const returnTo = requestedReturnTo.startsWith('/') && !requestedReturnTo.startsWith('//') ? requestedReturnTo : '/conta'

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
            <button
              onClick={() => switchTab('login')}
              className="text-sm font-semibold text-accent underline underline-offset-4"
            >
              Fazer login
            </button>
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

            {/* Google */}
            <button
              onClick={async () => {
                setGoogleLoading(true)
                await signInWithGoogle(returnTo)
                setGoogleLoading(false)
              }}
              disabled={googleLoading}
              className="btn-outline mb-5 w-full disabled:opacity-50"
            >
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Redirecionando...' : 'Google'}
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

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
