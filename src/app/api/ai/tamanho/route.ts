import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY!
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

const PREFERENCIA_MAP: Record<string, string> = {
  oversized: 'Oversized — o cliente quer que fique bem largo, caindo além dos ombros.',
  folgado: 'Folgado — o cliente quer bastante espaço, sem marcar o corpo.',
  regular: 'Regular — o cliente quer caimento clássico, nem apertado nem largo.',
  slim: 'Slim — o cliente quer mais próximo do corpo, valorizando o shape.',
  justo: 'Justo — o cliente quer bem colado ao corpo, segunda pele.',
}

function buildSystemPrompt(produto?: { nome: string; categoria: string; tamanhos: string[] }, preferencia?: string) {
  const base = `Você é um especialista em moda, modelagem e consultoria de tamanho para roupas masculinas e femininas. Analise os dados físicos e as fotos fornecidas e retorne uma análise detalhada de tamanho e caimento.`

  const contexto = produto
    ? ` O cliente está interessado especificamente no produto "${produto.nome}" (categoria: ${produto.categoria}, tamanhos disponíveis: ${produto.tamanhos.join(', ')}). Baseie sua recomendação nos tamanhos disponíveis desse produto e explique como essa peça específica vai cair nesse corpo.`
    : ''

  const pref = preferencia && PREFERENCIA_MAP[preferencia]
    ? ` PREFERÊNCIA DE CAIMENTO DO CLIENTE: ${PREFERENCIA_MAP[preferencia]} Leve isso em conta ao recomendar o tamanho — se o caimento desejado exige um tamanho acima ou abaixo do padrão para as medidas, explique isso claramente nos campos ombros/peito/cintura/quadril.`
    : ''

  return `${base}${contexto}${pref} Baseie sua análise em: proporções corporais reais, não apenas IMC. Uma pessoa pode ter 100kg com shape atlético ou com gordura concentrada — as fotos e medidas revelam isso. Retorne APENAS um JSON nesse formato exato: { "shape": "nome do shape corporal", "descricaoShape": "descrição em 2 frases de como é esse corpo", "tamanhoIdeal": "tamanho ideal dentre os disponíveis ou P/M/G/GG/XGG", "tamanhoAlternativo": "tamanho alternativo se aplicável", "ombros": "como vai ficar nos ombros${produto ? ` para o ${produto.nome}` : ''}","peito": "como vai ficar no peito${produto ? ` para o ${produto.nome}` : ''}", "cintura": "como vai ficar na cintura${produto ? ` para o ${produto.nome}` : ''}", "quadril": "como vai ficar no quadril${produto ? ` para o ${produto.nome}` : ''}", "dicaGeral": "dica de estilo específica para usar o ${produto ? produto.nome : 'produto'} com esse shape em 2 frases", "avatar": { "shape": "atletico|retangular|triangulo|triangulo-invertido|oval", "ombroLargura": "estreito|medio|largo", "cinturaMarcada": true/false, "quadrilLargura": "estreito|medio|largo" } }`
}

export async function POST(req: NextRequest) {
  try {
    const { altura, peso, ombro, peito, cintura, quadril, fotos, produto, preferencia } = await req.json()

    const medidas = `Medidas do cliente:
- Altura: ${altura} cm
- Peso: ${peso} kg
- Ombro: ${ombro ? ombro + ' cm' : 'não informado'}
- Peito/Busto: ${peito ? peito + ' cm' : 'não informado'}
- Cintura: ${cintura ? cintura + ' cm' : 'não informado'}
- Quadril: ${quadril ? quadril + ' cm' : 'não informado'}`

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: 'text', text: medidas },
    ]

    if (fotos && fotos.length > 0) {
      for (const foto of fotos.slice(0, 2)) {
        if (foto && foto.startsWith('data:image')) {
          userContent.push({ type: 'image_url', image_url: { url: foto } })
        }
      }
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(produto ?? undefined, preferencia ?? undefined) },
          { role: 'user', content: userContent },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Groq error: ${err}` }, { status: 500 })
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content ?? ''

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Resposta inválida da IA' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[tamanho]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
