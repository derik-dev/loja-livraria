export interface ProductColor {
  name: string
  hex: string
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  tags: string[]
  rating: number
  reviewCount: number
  stock: number
  featured: boolean
  colors?: ProductColor[]
  sizes?: string[]
  features?: string[]
  metaTitle?: string
  metaDescription?: string
  section?: string[]
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
  productCount: number
}

export interface CartItem {
  product: Product
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

export interface FilterState {
  category: string | null
  minPrice: number | null
  maxPrice: number | null
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest'
}
