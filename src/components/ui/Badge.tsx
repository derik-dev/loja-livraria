type BadgeVariant = 'default' | 'sale' | 'new' | 'soldout'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-600',
  sale: 'bg-red-600 text-white',
  new: 'bg-zinc-900 text-white',
  soldout: 'bg-zinc-100 text-zinc-400',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tracking-wide',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}

export default Badge
