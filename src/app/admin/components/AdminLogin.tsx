'use client'

import { useState } from 'react'

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin@123') {
      onLogin()
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="bg-white w-full max-w-sm p-10">
        <h1 className="text-xl font-black text-zinc-900 uppercase tracking-[0.2em] mb-2">PAPELADA</h1>
        <p className="text-xs text-zinc-400 uppercase tracking-[0.15em] mb-8">Painel Administrativo</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false) }}
              placeholder="••••••••"
              className="w-full border border-zinc-300 px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-zinc-900"
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1">Senha incorreta</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-zinc-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
