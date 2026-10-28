# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (uses Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Zustand 5

**Path alias:** `@/*` maps to `./src/*`

### Routing

All store pages live under `src/app/(store)/` using Next.js route groups:

| Route | Path |
|---|---|
| Home | `src/app/page.tsx` |
| Product listing | `src/app/(store)/produtos/` |
| Product detail | `src/app/(store)/produto/[slug]/` |
| Cart | `src/app/(store)/carrinho/` |
| Checkout | `src/app/(store)/checkout/` |
| Account | `src/app/(store)/conta/` |

### State Management

Cart state lives in `src/store/cartStore.ts` (Zustand), persisted to localStorage as `cart-storage`. The `useCart` hook in `src/hooks/useCart.ts` wraps this store. Wishlist state is in `src/hooks/useWishlist.ts`.

### Data Layer

Livros e categorias vêm do Supabase (`src/lib/supabase.ts`, sempre via `mapProduct`). As seções do site usam os slugs gravados em `products.section` (`masculino`, `feminino`, `inverno`, `tecnologia`, `acessorios`, `novidades`); só os rótulos mudaram para gêneros de livro e ficam em `src/lib/nav.ts`. Regras da loja (nome, frete grátis, textos de aviso) em `src/lib/brand.ts`.

### Visual (tema "biblioteca")

Tema único em `src/themes/biblioteca.css`: marrom-espresso + creme (destaque caramelo), com títulos em Poppins e texto em DM Sans. Fonte única de cor: variáveis `--bg`, `--bg-alt`, `--card`, `--card-hover`, `--ink`, `--muted`, `--accent`, `--border`, `--footer` (viram utilitários Tailwind v4 via `@theme inline`: `bg-bg`, `bg-card`, `text-ink`, `text-muted`, `bg-accent`...). Texto sobre fundo accent é sempre `text-on-accent`. A home fica em `src/components/home/`. Dois tons por seção: um wrapper com `data-tone="dark"` (padrão) ou `data-tone="light"` (+ `data-surface="alt"` para fundo branco) troca as variáveis daquela seção; componentes leem só as variáveis (`text-on-accent` para texto sobre accent, `text-on-image` sobre capas). O header (com a faixa de confiança) fica no topo da página e rola junto com ela (não é fixo), escuro e opaco. O CSS remapeia a paleta neutra do Tailwind (zinc/stone/gray), então `bg-zinc-900`, `border-zinc-300` etc. já saem no visual da loja; o `/admin` se marca com `data-admin` e mantém o visual original. Código novo usa as variáveis `--bk-*` e as classes `.bk-*`; as `.z-*` e `--z-*` são apelidos do tema anterior (zine) que ainda sustentam telas não migradas (catálogo, produto, carrinho, checkout, conta) e devem sumir quando elas forem refeitas. Livros sem foto usam a capa gerada de `components/zine/BookCover.tsx`.

### Component Organization

- `src/components/ui/` — primitive components (Button, Input, Badge)
- `src/components/product/` — ProductCard, ProductGrid, ProductFilters, ProductGallery
- `src/components/cart/` — CartDrawer, CartItem
- `src/components/layout/` — Header, Footer, MobileMenu
- `src/components/zine/` — blocos da home e utilitários visuais (HomeBanner, ShortcutCards, DealsRow, TopFive, GenreTiles, BookCover, PageHero)

Each component folder has an `index.ts` barrel export.
