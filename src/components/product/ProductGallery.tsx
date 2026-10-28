'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookCover } from '@/components/zine'

interface ProductGalleryProps {
  images: string[]
  alt: string
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  // Capa principal grande e, abaixo, as demais fotos (1 foto = só a capa)
  const [first, ...rest] = images

  const prev = useCallback(() => {
    setLightbox(i => i === null ? null : (i - 1 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    setLightbox(i => i === null ? null : (i + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (lightbox === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  return (
    <>
      {images.length === 0 ? (
        <div className="relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden rounded-sm shadow-[var(--shadow-card)] ring-1 ring-border"><BookCover title={alt} /></div>
      ) : (
        <div className="mx-auto w-full max-w-md">
          <div
            className="relative cursor-zoom-in overflow-hidden rounded-sm bg-card-hover shadow-[0_24px_50px_-18px_rgb(42_26_18/0.55)] ring-1 ring-border"
            onClick={() => setLightbox(0)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={first} alt={alt} className="aspect-[2/3] w-full object-cover" />
          </div>
          {rest.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {rest.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(i + 1)}
                  className="relative overflow-hidden rounded-sm bg-card-hover ring-1 ring-border transition-opacity hover:opacity-80"
                  aria-label={`Ver foto ${i + 2}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${alt} ${i + 2}`} className="aspect-[2/3] w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          data-tone="dark" className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-ink"
          onClick={() => setLightbox(null)}
        >
          {/* Fechar */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-ink hover:text-ink transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Contador */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-ink text-sm font-medium tracking-widest">
            {lightbox + 1} / {images.length}
          </div>

          {/* Seta esquerda */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-ink hover:text-ink transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Imagem */}
          <div
            className="max-h-[92vh] w-full h-full flex items-center justify-center px-20"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightbox]}
              alt={`${alt} ${lightbox + 1}`}
              className="max-h-[92vh] w-auto max-w-[calc(100vw-10rem)] object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Seta direita */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-ink hover:text-ink transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightbox(i) }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === lightbox ? 'bg-[#fff]' : 'bg-[#fff]/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
