import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'
import { BRAND_NAME } from '@/lib/brand'

export async function POST(req: NextRequest) {
  try {
    const { nome, categoria, descricao, tags } = await req.json()

    const prompt = `Você é um especialista em SEO para e-commerce brasileiro. Gere um meta title e meta description otimizados para Google para o seguinte livro/produto de uma livraria.

Nome: ${nome}
Categoria: ${categoria}
Descrição: ${descricao}
Tags: ${(tags as string[]).join(', ') || 'não informado'}

Regras obrigatórias: meta title deve ter entre 50 e 60 caracteres, incluir o título do livro e o nome da loja ${BRAND_NAME}, ser atrativo pra clique. Meta description deve ter entre 140 e 160 caracteres, incluir benefício principal, call to action sutil e palavra-chave natural.

Retorne APENAS um JSON nesse formato exato, sem texto adicional:
{"metaTitle": "...", "metaDescription": "..."}`

    const raw = await groqChat(prompt)
    const match = raw.match(/\{[\s\S]*?\}/)
    if (!match) throw new Error('no json')

    const { metaTitle, metaDescription } = JSON.parse(match[0])
    return NextResponse.json({ metaTitle, metaDescription })
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar SEO' }, { status: 500 })
  }
}
