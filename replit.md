# ShopSphere

ShopSphere is a responsive peer-to-peer marketplace prototype where people can buy, sell, discover, and manage products using local mock data.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/shopsphere run dev` — run the ShopSphere web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/shopsphere/src/App.tsx` — routes, shared shell, pages, and marketplace UI
- `artifacts/shopsphere/src/contexts/MarketplaceContext.tsx` — auth, cart, wishlist, marketplace state, and toast behavior
- `artifacts/shopsphere/src/services/mockStore.ts` — localStorage-backed mock data/services and seed data
- `artifacts/shopsphere/src/index.css` — ShopSphere design tokens and responsive styles

## Architecture decisions

- The first release is frontend-only and uses localStorage-backed adapters so buying, selling, order management, and admin moderation work without AWS credentials.
- User accounts, cart, wishlist, products, orders, categories, and analytics are accessed through context/service boundaries rather than direct component storage calls.
- Mock auth supports a normal user and an admin; frontend route guards are UX protection only and must be replaced with backend authorization when AWS Cognito/API Gateway is connected.
- Product images use reliable public image URLs with local preview support for seller-created listings.

## Product

ShopSphere includes marketplace discovery, multi-filter search and sorting, product details, favorites, cart and demo checkout, order tracking, seller listing management, received orders, admin moderation, category management, analytics readiness, and settings.

## User preferences

No additional preferences recorded.

## Gotchas

- The web build expects `PORT` and `BASE_PATH` from the managed workflow; standalone builds need those values supplied explicitly.
- This is demo auth and demo payment only; no AWS credentials, Cognito pool, real gateway, or production authorization is configured.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
