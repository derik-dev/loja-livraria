import Image from 'next/image'

interface PageHeroProps {
  title: string
  note: string
  image: string
  /** Mantido por compatibilidade com as telas que ainda passam a cor; o tema escuro usa uma só superfície. */
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'red' | 'lilac'
  /** Alinha com as seções largas da home (margem de 80px em vez de 1200px centralizado). */
  wide?: boolean
}

/** Faixa de topo das páginas de listagem: superfície escura com brilho suave. */
export default function PageHero({ title, note, image, wide = false }: PageHeroProps) {
  return (
    <section className="relative isolate min-h-[220px] overflow-hidden border-b border-border bg-[#21130d] sm:min-h-[250px]">
      <Image src={image} alt="" fill sizes="100vw" className="object-cover object-[58%_center]" priority />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,11,7,0.88)_0%,rgba(20,11,7,0.7)_42%,rgba(20,11,7,0.18)_100%),linear-gradient(0deg,rgba(20,11,7,0.22),transparent_60%)]" />
      <div className={`relative z-10 flex min-h-[220px] flex-col justify-end pb-9 pt-12 sm:min-h-[250px] sm:pb-12 sm:pt-14 ${wide ? 'px-4 md:px-12 lg:px-20' : 'mx-auto w-full max-w-[1200px] px-4'}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffc05f]">{note}</p>
        <h1 className="mt-2 text-[clamp(2.2rem,6vw,4rem)] leading-[1.02] text-[#fff]">{title}</h1>
      </div>
    </section>
  )
}
