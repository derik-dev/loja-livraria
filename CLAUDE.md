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

Product and category data is mocked in `src/lib/data/` — `products.ts` and `categories.ts`. Types are defined in `src/lib/types.ts`. There is no backend or API layer; all data is static.

### Component Organization

- `src/components/ui/` — primitive components (Button, Input, Badge)
- `src/components/product/` — ProductCard, ProductGrid, ProductFilters, ProductGallery
- `src/components/cart/` — CartDrawer, CartItem
- `src/components/layout/` — Header, Footer, MobileMenu

Each component folder has an `index.ts` barrel export.
