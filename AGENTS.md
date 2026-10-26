# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 storefront using the App Router, React 19, TypeScript, Tailwind CSS 4, and Zustand. Routes live in `src/app/`; storefront routes are grouped under `src/app/(store)/`. Reusable components are organized by domain in `src/components/{ui,product,cart,layout}`, with barrel exports in each folder's `index.ts`. Hooks belong in `src/hooks`, shared types and utilities in `src/lib`, mock catalog data in `src/lib/data`, and client state in `src/store`. Static assets belong in `public/`.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` starts the local development server at `http://localhost:3000`.
- `npm run lint` checks TypeScript and React code with ESLint and Next.js Core Web Vitals rules.
- `npm run build` creates a production build and catches routing and type errors.
- `npm run start` serves the completed production build.

Run `npm run lint` and `npm run build` before opening a pull request.

## Coding Style & Naming Conventions

Use strict TypeScript and the `@/` alias for imports from `src`. Follow the existing style: two-space indentation, single quotes, no semicolons, and trailing commas in multiline structures. Name React components and their files in PascalCase (`ProductCard.tsx`), hooks with a `use` prefix (`useCart.ts`), and stores with a descriptive camelCase suffix (`cartStore.ts`). Keep route entry files named `page.tsx` or `layout.tsx`. Add `'use client'` only where browser APIs, event handlers, or client state require it. Prefer small domain components over large route files.

## Testing Guidelines

No automated test framework or coverage target is currently configured. For every change, lint and build the project, then manually verify affected routes and responsive states. If tests are introduced, colocate them as `*.test.ts` or `*.test.tsx` and add the corresponding command to `package.json` and this guide.

## Commit & Pull Request Guidelines

Git history is unavailable in this working copy, so use concise imperative commits; Conventional Commit prefixes are encouraged, for example `feat: add quantity selector` or `fix: preserve cart totals`. Pull requests should explain the change and verification performed, link relevant issues, and include before/after screenshots for visible UI changes. Keep unrelated refactors out of feature or bug-fix pull requests.

## Configuration & Data

Do not commit secrets or local environment files. Product and category data is currently static in `src/lib/data`; preserve shared shapes in `src/lib/types.ts`. Cart data persists in `localStorage` under `cart-storage`, so account for existing browser state when testing cart changes.
