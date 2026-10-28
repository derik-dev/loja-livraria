import { siteConfig } from '@/site.config'

// Nome, textos e regras da loja vêm de src/site.config.ts. Estes apelidos mantêm os imports antigos funcionando.
export const BRAND_NAME = siteConfig.name

export const BRAND_TAGLINE = siteConfig.tagline

export const BRAND_ANNOUNCEMENT = siteConfig.announcements.join(' · ')

// Valor mínimo do carrinho para ganhar frete grátis
export const FREE_SHIPPING_THRESHOLD = siteConfig.freeShippingThreshold
