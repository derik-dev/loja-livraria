import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wdsijmsmjjogecafvdwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkc2lqbXNtampvZ2VjYWZ2ZHdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc5NDAzOSwiZXhwIjoyMDk3MzcwMDM5fQ.ayb-1GYyYYSBUWsPvtzAFi7kl8dq25T91HE-ZRgwz54'
)

const products = [
  {
    id: '1', slug: 'smartphone-pro-ultra', name: 'Smartphone Pro Ultra',
    description: 'O mais avançado smartphone do mercado com câmera de 200MP, processador de última geração e bateria de longa duração. Experiência premium em suas mãos.',
    price: 3499.99, original_price: 4199.99,
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&h=600&fit=crop&q=80'],
    category: 'eletronicos', tags: ['smartphone','tecnologia','celular'], rating: 4.8, review_count: 324, stock: 15, featured: true,
  },
  {
    id: '2', slug: 'fone-bluetooth-premium', name: 'Fone Bluetooth Premium',
    description: 'Fone de ouvido sem fio com cancelamento ativo de ruído, qualidade de som excepcional e até 30 horas de bateria. Perfeito para música e chamadas.',
    price: 599.99, original_price: 799.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&q=80'],
    category: 'eletronicos', tags: ['fone','bluetooth','audio'], rating: 4.6, review_count: 187, stock: 42, featured: true,
  },
  {
    id: '3', slug: 'smartwatch-fitness', name: 'Smartwatch Fitness Pro',
    description: 'Relógio inteligente com monitoramento completo de saúde, GPS integrado, resistência à água e design elegante para o dia a dia.',
    price: 899.99, original_price: null,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop&q=80'],
    category: 'eletronicos', tags: ['smartwatch','fitness','relogio'], rating: 4.5, review_count: 256, stock: 28, featured: false,
  },
  {
    id: '4', slug: 'camiseta-premium-algodao', name: 'Camiseta Premium Algodão',
    description: 'Camiseta 100% algodão egípcio, corte moderno e confortável. Tecido de alta qualidade que mantém a forma após várias lavagens.',
    price: 89.99, original_price: 129.99,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=600&fit=crop&q=80'],
    category: 'roupas', tags: ['camiseta','algodao','casual'], rating: 4.7, review_count: 512, stock: 150, featured: true,
  },
  {
    id: '5', slug: 'calca-jeans-slim', name: 'Calça Jeans Slim Fit',
    description: 'Calça jeans de corte slim com tecido stretch para maior conforto e mobilidade. Versatil para looks casuais e semi-formais.',
    price: 189.99, original_price: null,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop&q=80'],
    category: 'roupas', tags: ['calca','jeans','slim'], rating: 4.4, review_count: 298, stock: 75, featured: false,
  },
  {
    id: '6', slug: 'tenis-running-pro', name: 'Tênis Running Pro',
    description: 'Tênis de corrida com tecnologia de amortecimento avançada, palmilha ortopédica e cabedal respirável. Ideal para treinos intensos.',
    price: 349.99, original_price: 449.99,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&q=80'],
    category: 'roupas', tags: ['tenis','corrida','esporte'], rating: 4.9, review_count: 643, stock: 33, featured: true,
  },
  {
    id: '7', slug: 'bolsa-couro-classica', name: 'Bolsa Couro Clássica',
    description: 'Bolsa feminina em couro genuíno com acabamento refinado. Espaçosa, com múltiplos compartimentos e alça ajustável.',
    price: 459.99, original_price: 599.99,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop&q=80'],
    category: 'acessorios', tags: ['bolsa','couro','feminino'], rating: 4.8, review_count: 178, stock: 20, featured: true,
  },
  {
    id: '8', slug: 'oculos-sol-polarizado', name: 'Óculos de Sol Polarizado',
    description: 'Óculos de sol com lentes polarizadas UV400, armação em acetato premium. Proteção total e estilo para qualquer ocasião.',
    price: 299.99, original_price: null,
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&q=80','https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&h=600&fit=crop&q=80'],
    category: 'acessorios', tags: ['oculos','sol','polarizado'], rating: 4.6, review_count: 94, stock: 45, featured: false,
  },
]

const { error } = await supabase.from('products').upsert(products)
if (error) {
  console.error('Erro:', error.message)
} else {
  console.log('✓ Produtos inseridos com sucesso!')
}
