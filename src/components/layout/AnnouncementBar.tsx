import { siteConfig } from '@/site.config'

/** Barra de aviso do topo: marquee infinito só com transform (CSS), pausa no hover e para com prefers-reduced-motion. */
export default function AnnouncementBar() {
  const messages = siteConfig.announcements
  if (messages.length === 0) return null

  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {messages.map((message, i) => (
        <li key={`${message}-${i}`} className="flex items-center whitespace-nowrap px-5 text-xs text-ink/90 sm:text-[13px]">
          {message}
          <span className="ml-10 text-tan" aria-hidden="true">✦</span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="marquee overflow-hidden border-b border-border bg-bg-alt" role="region" aria-label="Avisos da loja">
      <div className="marquee-track py-2.5">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
