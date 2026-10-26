import { createClient } from '@supabase/supabase-js'
import type { Product } from '@/lib/types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anon)

// Cliente sem sessão de auth — usado no painel admin para evitar conflito com JWT do usuário
// storageKey diferente evita o warning "Multiple GoTrueClient instances"
export const supabaseAdmin = createClient(url, anon, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'sb-admin-no-session',
  },
})

export function createAdminClient() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Mapeia linha do Supabase (snake_case) → tipo Product (camelCase)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    images: row.images ?? [],
    category: row.category,
    tags: row.tags ?? [],
    rating: Number(row.rating),
    reviewCount: row.review_count ?? 0,
    stock: row.stock ?? 0,
    featured: row.featured ?? false,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    features: row.features ?? [],
    metaTitle: row.meta_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
    section: row.section ?? [],
  }
}
