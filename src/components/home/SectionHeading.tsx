import Link from 'next/link'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  href?: string
  linkLabel?: string
  id?: string
}

/** Cabeçalho padrão das seções da home: sobretítulo, título grande e link opcional. */
export default function SectionHeading({ eyebrow, title, href, linkLabel = 'Ver todos', id }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>}
        <h2 id={id} className="mt-1.5 text-3xl text-ink md:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="btn-outline !min-h-[40px] !px-4 !py-2 !text-sm shrink-0">{linkLabel}</Link>
      )}
    </div>
  )
}
