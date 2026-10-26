import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'

export async function POST(req: NextRequest) {
  const { query, products } = await req.json()

  if (!query?.trim()) {
    return NextResponse.json({ products })
  }

  const productList = products.map((p: { id: string; name: string; category: string; tags: string[]; description: string }) =>
    `ID: ${p.id} | Nome: ${p.name} | Categoria: ${p.category} | Tags: ${(p.tags ?? []).join(', ')} | Descrição: ${p.description}`
  ).join('\n')

  const prompt = `Você é o assistente de busca de uma livraria online. O usuário descreveu o que procura (pode ser um título, tema, clima ou ocasião): "${query}".
Analise a lista de livros abaixo e retorne APENAS um array JSON com os IDs dos mais relevantes, do mais relevante ao menos relevante.
Retorne no máximo 6. Responda SOMENTE o JSON, sem texto adicional.

Livros:
${productList}`

  try {
    const raw = await groqChat(prompt)
    const match = raw.match(/\[[\s\S]*?\]/)
    if (!match) return NextResponse.json({ products: [] })

    const ids: string[] = JSON.parse(match[0])
    const ordered = ids
      .map((id) => products.find((p: { id: string }) => p.id === id))
      .filter(Boolean)

    return NextResponse.json({ products: ordered })
  } catch (err) {
    console.error('[AI Search] Groq error:', err)
    return NextResponse.json({ products }, { status: 500 })
  }
}
