import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const { pedidos, produtos } = await req.json()

    const listaPedidos = (pedidos as { product_name: string; total: number; status: string; created_at: string }[])
      .slice(0, 30)
      .map((o) => `- ${o.product_name} | R$${Number(o.total).toFixed(2)} | ${o.status} | ${o.created_at.slice(0, 10)}`)
      .join('\n')

    const listaProdutos = (produtos as { name: string; category: string; stock: number; price: number; featured: boolean }[])
      .slice(0, 40)
      .map((p) => `- ${p.name} | ${p.category} | estoque:${p.stock} | R$${p.price}${p.featured ? ' | destaque' : ''}`)
      .join('\n')

    const prompt = `Você é um analista de e-commerce especialista em varejo brasileiro. Analise os dados abaixo e retorne exatamente 3 insights acionáveis para o lojista.

Pedidos recentes:
${listaPedidos || '(nenhum pedido ainda)'}

Produtos:
${listaProdutos || '(nenhum produto ainda)'}

Cada insight deve ser prático e direto — algo que o lojista pode agir hoje. Exemplos de categorias de insight: estoque crítico, produto com alta demanda, melhor dia/horário pra promoção, produto parado sem venda, oportunidade de upsell, tendência de categoria.

Retorne APENAS um JSON nesse formato exato, sem texto adicional:
[{"icone": "⚠️", "tipo": "ESTOQUE", "titulo": "Título curto", "descricao": "Descrição acionável em até 2 frases."}, ...]
com exatamente 3 objetos.`

    const raw = await groqChat(prompt)
    const match = raw.match(/\[[\s\S]*?\]/)
    if (!match) return NextResponse.json({ insights: [] })

    const insights = JSON.parse(match[0])
    return NextResponse.json({ insights })
  } catch {
    return NextResponse.json({ insights: [] }, { status: 500 })
  }
}
