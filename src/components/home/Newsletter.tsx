'use client'

import { useState } from 'react'
import { siteConfig } from '@/site.config'

/**
 * Newsletter: faixa tan com campo de e-mail. Por enquanto só valida o e-mail e mostra a confirmação
 * (ligue o envio a um serviço de e-mail no onSubmit quando for publicar).
 */
export default function Newsletter() {
  const { title, text, placeholder, button, success } = siteConfig.newsletter
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'error' | 'done'>('idle')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('error')
      return
    }
    setState('done')
  }

  return (
    <section className="bg-tan py-14 text-espresso-deep md:py-20" aria-labelledby="newsletter-titulo">
      <div className="container-page grid items-center gap-8 md:grid-cols-[1fr_1fr] md:gap-14">
        <div>
          <h2 id="newsletter-titulo" className="text-3xl text-espresso-deep md:text-5xl">{title}</h2>
          <p className="mt-4 max-w-md text-base md:text-lg">{text}</p>
        </div>

        {state === 'done' ? (
          <p role="status" className="rounded-2xl bg-espresso-deep px-6 py-5 text-base text-creme md:text-lg">{success}</p>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">E-mail</label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
                placeholder={placeholder}
                aria-invalid={state === 'error'}
                className="min-h-[54px] flex-1 rounded-full border border-espresso-deep/30 bg-creme-card px-6 text-base text-espresso placeholder:text-espresso/60 focus:border-espresso-deep focus:outline-none"
              />
              <button type="submit" className="min-h-[54px] rounded-full bg-espresso-deep px-8 text-base font-semibold text-creme transition-colors hover:bg-espresso">{button}</button>
            </div>
            {state === 'error' && <p role="alert" className="mt-3 text-sm font-medium">Digite um e-mail válido.</p>}
          </form>
        )}
      </div>
    </section>
  )
}
