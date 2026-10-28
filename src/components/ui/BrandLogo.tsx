import { BRAND_NAME } from '@/lib/brand'

interface BrandLogoProps {
  /** Mantido por compatibilidade: o tema agora é único (escuro). */
  variant?: 'dark' | 'light'
  className?: string
  textClassName?: string
}

// Logo da loja: livro aberto em accent + nome em Poppins
export default function BrandLogo({ variant = 'dark', className = '', textClassName = 'text-2xl' }: BrandLogoProps) {
  if (variant === 'light') {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <svg viewBox="0 0 64 48" className="h-12 w-16 shrink-0 text-[#ffbd59]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M32 13C22 3 10 7 4 16c9-4 18 0 28 9 10-9 19-13 28-9C54 7 42 3 32 13Z" />
          <path d="M5 23c10-3 18 2 27 9 9-7 17-12 27-9M8 30c9-2 16 3 24 9 8-6 15-11 24-9M32 10v30M32 13C29 7 29 4 32 2c3 2 3 5 0 11Z" />
        </svg>
        <span className="flex flex-col leading-none">
          <span className={`font-[Georgia,serif] text-[#fff8ef] ${textClassName}`}>{BRAND_NAME}</span>
          <span className="mt-1 text-center text-[9px] font-medium uppercase tracking-[0.7em] text-[#ffbd59]">Livraria</span>
        </span>
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-[1.35em] w-[1.35em] flex-shrink-0" aria-hidden="true">
        <circle cx="16" cy="16" r="16" fill="var(--accent)" />
        <path
          d="M16 10.2c-2-1.5-4.6-1.9-7.2-1.4v12.1c2.6-.5 5.2-.1 7.2 1.4 2-1.5 4.6-1.9 7.2-1.4V8.8c-2.6-.5-5.2-.1-7.2 1.4z M16 10.2v12.5"
          fill="none"
          stroke="var(--on-accent)"
          strokeWidth="1.7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span className={`bk-display text-ink ${textClassName}`} style={{ fontWeight: 600, letterSpacing: '0.02em' }}>
        {BRAND_NAME}
      </span>
    </span>
  )
}
