'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { siteConfig } from '@/site.config'

/**
 * Vídeo: a imagem de capa abre um modal. O iframe só é criado depois do clique (nada de vídeo carregando na home).
 * Esc ou clique fora fecham. Sem `youtubeId` no site.config o modal mostra um aviso.
 */
export default function VideoSection() {
  const { eyebrow, title, text, poster, posterAlt, youtubeId } = siteConfig.video
  const [open, setOpen] = useState(false)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const trigger = opener.current
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      trigger?.focus()
    }
  }, [open])

  return (
    <section data-tone="dark" className="bg-bg py-14 md:py-20" aria-labelledby="video-titulo">
      <div className="container-page grid items-center gap-8 md:grid-cols-[7fr_5fr] md:gap-12">
        <button
          ref={opener}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Assistir: ${title}`}
          className="group relative aspect-video overflow-hidden rounded-2xl bg-espresso-deep text-left"
        >
          <Image src={poster} alt={posterAlt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-espresso-deep/70 to-transparent" aria-hidden="true" />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-tan text-espresso-deep shadow-[0_20px_40px_-12px_rgb(0_0_0/0.7)] transition-transform duration-300 group-hover:scale-110">
            <svg className="ml-1 h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
          <h2 id="video-titulo" className="mt-2 text-3xl text-ink md:text-4xl">{title}</h2>
          <p className="mt-4 text-base text-muted md:text-lg">{text}</p>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label={title} onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-[960px]" onClick={(e) => e.stopPropagation()}>
            <button ref={closeBtn} type="button" onClick={() => setOpen(false)} aria-label="Fechar vídeo" className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full text-3xl text-creme hover:bg-creme/10">×</button>
            <div className="aspect-video overflow-hidden rounded-xl bg-espresso-deep">
              {youtubeId ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title={title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <p className="flex h-full items-center justify-center px-6 text-center text-creme/80">Adicione o código do vídeo do YouTube em site.config.ts (video.youtubeId).</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
