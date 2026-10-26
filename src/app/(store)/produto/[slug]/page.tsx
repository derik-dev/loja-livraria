import type { Metadata } from 'next'
import ProductPageClient from './ProductPageClient'
import { BRAND_NAME } from '@/lib/brand'
import { getMockProductBySlug } from '@/lib/data/products'

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  return getMockProductBySlug(slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await getProduct(slug)

  if (!p) return { title: `Livro | ${BRAND_NAME}` }

  const title = p.metaTitle || `${p.name} | ${BRAND_NAME}`
  const description = p.metaDescription || p.description.slice(0, 155)
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
