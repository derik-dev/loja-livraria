import { NextRequest, NextResponse } from 'next/server'
import { BRAND_NAME } from '@/lib/brand'

const GROQ_API_KEY = process.env.GROQ_API_KEY!

interface Product {
  name: string
  slug: string
  author?: string
  category: string
  price: number
  description?: string
  colors?: { name: string }[]
  sizes?: string[]
}

interface Message {
  role: string
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, products } = await req.json()

    const productList = (products as Product[])
      .slice(0, 60)
      .map((p) =>
        `- ${p.name}${p.author ? ' | autor: ' + p.author : ''} | slug:${p.slug} | ${p.category} | R$${p.price}${p.description ? ' | ' + p.description.slice(0, 80) : ''}${p.colors?.length ? ' | edições: ' + p.colors.map((c) => c.name).join(', ') : ''}${p.sizes?.length ? ' | formatos: ' + p.sizes.join(', ') : ''}`
      )
      .join('\n')

    const systemPrompt = `Você é a assistente virtual da ${BRAND_NAME}, uma livraria brasileira independente. Seu nome é Vera. Você é simpática, bem-humorada, direta e conhece profundamente todos os livros e itens da loja. Seu objetivo é ajudar o cliente a encontrar o livro certo (para si ou para presentear) e incentivá-lo a comprar. Pergunte o gosto de leitura quando faltar contexto. Quando recomendar um livro, sempre mencione o nome exato, o preço e termine com o slug do produto entre colchetes assim: [slug-do-produto] — isso vai virar um link clicável. Nunca invente livros, autores ou informações que não estão na lista; se o dado não aparece, diga que não tem essa informação. Se não souber responder, seja honesta e sugira entrar em contato. Responda sempre em português brasileiro, de forma natural e humana, com no máximo 3 frases.

Livros e itens disponíveis:
${productList || '(nenhum produto cadastrado ainda)'}`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history as Message[]).slice(-10),
      { role: 'user', content: message },
    ]

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    const data = await res.json()
    const content: string = data.choices?.[0]?.message?.content ?? 'Desculpe, não consegui responder agora.'

    const slugMatches = [...content.matchAll(/\[([a-z0-9-]+)\]/g)]
    const productSlugs = slugMatches.map((m) => m[1])

    return NextResponse.json({ message: content, productSlugs })
  } catch {
    return NextResponse.json(
      { message: 'Desculpe, tive um problema técnico. Tente novamente!', productSlugs: [] },
      { status: 500 }
    )
  }
}
