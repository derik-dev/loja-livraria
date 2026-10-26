import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

interface StockItem {
  id: string
  quantity: number
  currentStock: number
}

export async function POST(req: NextRequest) {
  const { items }: { items: StockItem[] } = await req.json()

  if (!items?.length) {
    return NextResponse.json({ error: 'Nenhum item.' }, { status: 400 })
  }

  const admin = createAdminClient()

  for (const item of items) {
    const newStock = Math.max(0, item.currentStock - item.quantity)
    await admin
      .from('products')
      .update({ stock: newStock })
      .eq('id', item.id)
  }

  return NextResponse.json({ ok: true })
}
