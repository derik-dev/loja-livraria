'use client'

// Coordenação entre o preloader e as animações de entrada da home (o hero só começa quando ele termina).
type PreloaderWindow = Window & { __preloader?: 'running' | 'done' }

const KEY = 'papelada:preloader'

/** Roda 1x por sessão e nunca com prefers-reduced-motion. */
export function shouldRunPreloader() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return !sessionStorage.getItem(KEY)
  } catch {
    return false
  }
}

export function markPreloaderStarted() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    /* sessionStorage indisponível: tudo bem, só roda de novo */
  }
  ;(window as PreloaderWindow).__preloader = 'running'
}

export function markPreloaderDone() {
  ;(window as PreloaderWindow).__preloader = 'done'
  window.dispatchEvent(new Event('preloader:done'))
}

/** Tempo máximo de espera: passou disso, hero e cards são liberados mesmo se o preloader falhar. */
export const PRELOADER_SAFETY_MS = 6000

/** Executa `cb` já, quando o preloader terminar, ou após o timeout de segurança. Devolve a função que cancela a espera. */
export function onPreloaderDone(cb: () => void) {
  if ((window as PreloaderWindow).__preloader !== 'running') {
    cb()
    return () => {}
  }
  let called = false
  const run = () => {
    if (called) return
    called = true
    window.clearTimeout(timer)
    window.removeEventListener('preloader:done', run)
    cb()
  }
  const timer = window.setTimeout(run, PRELOADER_SAFETY_MS)
  window.addEventListener('preloader:done', run, { once: true })
  return () => {
    called = true
    window.clearTimeout(timer)
    window.removeEventListener('preloader:done', run)
  }
}
