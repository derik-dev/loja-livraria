import { BRAND_NAME } from '@/lib/brand'

interface BrandLogoProps {
  /** "dark" = tinta sobre fundo claro; "light" = branco sobre fundo escuro */
  variant?: 'dark' | 'light'
  className?: string
  textClassName?: string
}

// Logo da loja: livro aberto dourado + nome em serifa
export default function BrandLogo({ variant = 'dark', className = '', textClassName = 'text-2xl' }: BrandLogoProps) {
  const light = variant === 'light'
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-[1.35em] w-[1.35em] flex-shrink-0" style={{ fontSize: 'inherit' }} aria-hidden="true">
        <circle cx="16" cy="16" r="16" fill="var(--bk-gold)" />
        <path
          d="M16 10.2c-2-1.5-4.6-1.9-7.2-1.4v12.1c2.6-.5 5.2-.1 7.2 1.4 2-1.5 4.6-1.9 7.2-1.4V8.8c-2.6-.5-5.2-.1-7.2 1.4z M16 10.2v12.5"
          fill="none"
          stroke={light ? '#fff' : 'var(--bk-navy)'}
          strokeWidth="1.7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`bk-display ${textClassName} ${light ? 'text-white' : 'text-[var(--bk-navy)]'}`}
        style={{ fontWeight: 800, letterSpacing: '-0.01em' }}
      >
        {BRAND_NAME}
      </span>
    </span>
  )
}
