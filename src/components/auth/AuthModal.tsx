'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import BrandLogo from '@/components/ui/BrandLogo'
import { BRAND_NAME } from '@/lib/brand'

export default function AuthModal() {
  const { closeAuthModal, signIn, signUp, signInWithGoogle } = useAuth()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
      else closeAuthModal()
    } else {
      const { error } = await signUp(email, password, name)
      if (error) setError(traducirErro(error))
      else setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-100 px-4">
      {/* Fechar — canto superior direito */}
      <button
        onClick={closeAuthModal}
        className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-700 transition-colors"
        aria-label="Fechar"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="mb-8"><BrandLogo className="h-8 w-auto object-contain" textClassName="text-xl" /></div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">

        {success ? (
          <div className="text-center py-4">
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Conta criada!</h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Verifique seu e-mail para confirmar o cadastro.
            </p>
            <button
              onClick={() => switchTab('login')}
              className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Fazer login
            </button>
          </div>
        ) : (
          <>
            {/* Título */}
            <h2 className="text-xl font-bold text-zinc-900 text-center mb-1">
              {tab === 'login' ? 'Fazer login' : 'Criar conta'}
            </h2>
            <p className="text-sm text-center font-medium mb-6">
              {tab === 'login' ? 'Entra aí e continua a leitura' : 'Preencha os dados abaixo'}
            </p>

            {/* Google */}
            <button
              onClick={async () => {
                setGoogleLoading(true)
                await signInWithGoogle()
                setGoogleLoading(false)
              }}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2.5 border border-zinc-300 rounded-lg py-2.5 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 transition-colors disabled:opacity-50 mb-5"
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
              <div className="flex-1 h-px bg-zinc-200" />
              <span className="text-xs text-zinc-400">ou</span>
              <div className="flex-1 h-px bg-zinc-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label className="block text-sm text-zinc-600 mb-1.5">Nome</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full border border-zinc-300 rounded-lg px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-zinc-600 mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full border border-zinc-300 rounded-lg px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1.5">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-zinc-300 rounded-lg px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {loading ? '...' : 'Continuar'}
              </button>
            </form>

            {/* Switch tab */}
            <p className="text-center text-sm text-zinc-400 mt-5">
              {tab === 'login' ? (
                <>Não tem conta?{' '}
                  <button onClick={() => switchTab('signup')} className="font-semibold text-zinc-700 hover:text-zinc-900 underline underline-offset-2">
                    Cadastre-se
                  </button>
                </>
              ) : (
                <>Já tem conta?{' '}
                  <button onClick={() => switchTab('login')} className="font-semibold text-zinc-700 hover:text-zinc-900 underline underline-offset-2">
                    Entrar
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-zinc-400">© {BRAND_NAME}</p>
    </div>
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
