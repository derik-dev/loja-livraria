import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import ProductPageClient from './ProductPageClient'
import { BRAND_NAME } from '@/lib/brand'

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('products')
    .select('name, description, images, meta_title, meta_description')
    .eq('slug', slug)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await getProduct(slug)

  if (!p) return { title: `Livro | ${BRAND_NAME}` }

  const title = p.meta_title || `${p.name} | ${BRAND_NAME}`
  const description = p.meta_description || (p.description ?? '').slice(0, 155)
  const image = p.images?.[0] ?? null

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default function ProductPage({ params }: Props) {
  return <ProductPageClient params={params} />
}
