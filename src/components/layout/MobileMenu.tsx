'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { SECTIONS } from '@/lib/nav'
import BrandLogo from '@/components/ui/BrandLogo'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, signOut, openAuthModal } = useAuth()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!isOpen}
      className={[
        'fixed inset-0 z-50 flex flex-col bg-bg transition-[transform,visibility] duration-300 ease-in-out md:hidden',
        isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full',
      ].join(' ')}
    >
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border px-4">
        <Link href="/" onClick={onClose} aria-label="Papelada, página inicial">
          <BrandLogo textClassName="text-[1.3rem]" />
        </Link>
        <button onClick={onClose} aria-label="Fechar menu" className="flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-card-hover">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {user ? (
          <p className="mb-6 text-sm text-muted">Olá, <strong className="text-ink">{(user.user_metadata?.name as string | undefined)?.split(' ')[0] ?? user.email}</strong></p>
        ) : (
          <div className="mb-6 flex gap-3">
            <button onClick={() => { onClose(); openAuthModal() }} className="btn-primary flex-1">Entrar</button>
            <button onClick={() => { onClose(); openAuthModal() }} className="btn-outline flex-1">Criar conta</button>
          </div>
        )}

        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">Categorias</p>
        <ul className="divide-y divide-border">
          {SECTIONS.map((s) => (
            <li key={s.slug}>
              <Link href={`/secao/${s.slug}`} onClick={onClose} className="flex items-center justify-between py-4 text-lg text-ink">
                {s.label}
                <span className="text-muted" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/produtos" onClick={onClose} className="flex items-center justify-between py-4 text-lg font-semibold text-accent">
              Ver todo o catálogo
              <span aria-hidden="true">›</span>
            </Link>
          </li>
        </ul>

        <ul className="mt-4">
          <li><Link href="/conta" onClick={onClose} className="block py-3 text-[15px] text-ink">Minhas compras</Link></li>
          {user && (
            <li><button onClick={() => { signOut(); onClose() }} className="block w-full py-3 text-left text-[15px] text-muted">Sair</button></li>
          )}
        </ul>
      </nav>
    </div>
  )
}
