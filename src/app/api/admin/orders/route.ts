import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const supabase = adminClient()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error }, { status: 500 })

    // Busca imagem do produto pelo nome
    const { data: product } = await supabase
      .from('products')
      .select('images, slug')
      .ilike('name', `%${order.product_name.split(' ').slice(0, 3).join(' ')}%`)
      .limit(1)
      .single()

    return NextResponse.json({ ...order, product_image: product?.images?.[0] ?? null, product_slug: product?.slug ?? null })
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...update } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = adminClient()
  const { error } = await supabase.from('orders').update(update).eq('id', id)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
