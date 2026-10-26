'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { SECTIONS } from '@/lib/nav'
import BrandLogo from '@/components/ui/BrandLogo'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const { user, signOut, openAuthModal } = useAuth()

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      document.body.style.overflow = 'hidden'
    } else {
      setVisible(false)
      document.body.style.overflow = ''
      const t = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-in-out md:hidden',
        visible ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
    >
      <div className="flex h-14 flex-shrink-0 items-center justify-between bg-[var(--bk-navy)] px-3 text-white">
        <button onClick={onClose} aria-label="Fechar menu" className="flex h-10 w-10 items-center justify-center">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <Link href="/" onClick={onClose} aria-label="Página inicial">
          <BrandLogo variant="light" textClassName="text-[1.35rem]" />
        </Link>
        <span className="w-10" aria-hidden="true" />
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="bg-[var(--bk-paper)] px-5 py-4">
          {user ? (
            <p className="text-sm">Olá, <strong>{(user.user_metadata?.name as string | undefined)?.split(' ')[0] ?? user.email}</strong></p>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => { onClose(); openAuthModal() }} className="bk-btn flex-1 !py-2.5">Entre</button>
              <button onClick={() => { onClose(); openAuthModal() }} className="bk-btn bk-btn--outline flex-1 !py-2.5">Crie sua conta</button>
            </div>
          )}
        </div>

        <p className="bk-eyebrow px-5 pb-1 pt-5">Categorias</p>
        <ul>
          {SECTIONS.map((s) => (
            <li key={s.slug} className="border-b border-[var(--bk-paper-2)]">
              <Link href={`/secao/${s.slug}`} onClick={onClose} className="flex items-center justify-between px-5 py-4 text-base">
                {s.label}
                <span className="text-zinc-400" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
          <li className="border-b border-[var(--bk-paper-2)]">
            <Link href="/produtos" onClick={onClose} className="flex items-center justify-between px-5 py-4 text-base font-semibold text-[var(--bk-navy-2)]">
              Ver todo o catálogo
              <span aria-hidden="true">›</span>
            </Link>
          </li>
        </ul>

        <ul className="px-0 py-2">
          <li><Link href="/conta" onClick={onClose} className="block px-5 py-3.5 text-[15px]">Minhas compras</Link></li>
          {user && (
            <li><button onClick={() => { signOut(); onClose() }} className="block w-full px-5 py-3.5 text-left text-[15px]">Sair</button></li>
          )}
        </ul>
      </nav>
    </div>
  )
}
