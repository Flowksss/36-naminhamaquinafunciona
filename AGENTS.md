# CCT SINCRO — Instructions for Codex Agents

## Project
Agribusiness ERP (hackathon). Next.js 14 App Router + TypeScript + Prisma + PostgreSQL + Tailwind CSS.

## Tech Stack
| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL (Neon serverless) |
| Auth | NextAuth.js v4 |
| Deploy | Vercel |

## Folder Structure
```
src/
  app/
    (dashboard)/          # Route group — shares sidebar layout
      dashboard/          # /dashboard — stats overview
      fazendas/           # /dashboard/fazendas — farm management
      safras/             # /dashboard/safras — crop cycle management
      insumos/            # /dashboard/insumos — supply inventory
      financeiro/         # /dashboard/financeiro — cash flow
      fornecedores/       # /dashboard/fornecedores — suppliers
      clientes/           # /dashboard/clientes — buyers
    api/auth/[...nextauth]/
    login/
  lib/
    db.ts                 # Prisma singleton — always import from here
    auth.ts               # NextAuth config
    utils.ts              # cn(), formatCurrency(), formatDate()
prisma/
  schema.prisma
```

## Database Models
- **User** — email/password auth, roles: `ADMIN | GERENTE | OPERADOR`
- **Fazenda** — farm: nome, area (ha), localizacao, tipoSolo
- **Safra** — harvest cycle linked to Fazenda; status: `PLANEJADA | EM_ANDAMENTO | COLHIDA | CANCELADA`
- **Insumo** — supply item with stock quantity and minimum threshold
- **MovimentoEstoque** — stock movement (ENTRADA/SAIDA) linked to Insumo and optionally Safra
- **Fornecedor** — supplier; linked to Insumo
- **Cliente** — buyer; linked to Transacao
- **Transacao** — financial transaction (RECEITA/DESPESA) optionally linked to Safra/Fornecedor/Cliente

## Key Rules
1. **Database access**: always `import { db } from "@/lib/db"` — never instantiate PrismaClient directly
2. **Imports**: use `@/` alias (e.g. `@/lib/db`, `@/app/...`)
3. **Components**: default to Server Components; add `"use client"` only when using hooks or browser APIs
4. **Mutations**: implement as Next.js Server Actions or API Routes under `src/app/api/`
5. **Styling**: Tailwind utility classes; CSS variables defined in `globals.css`; no inline styles
6. **Types**: no `any`; leverage Prisma-generated types

## Setup (local)
```bash
npm install
cp .env.example .env
# Fill in DATABASE_URL (Neon PostgreSQL) and NEXTAUTH_SECRET
npm run db:push
npm run db:generate
npm run dev
```

## Useful Scripts
```bash
npm run db:push       # Push schema to DB
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:studio     # Prisma Studio (visual DB browser)
npm run db:seed       # Seed with sample data (create prisma/seed.ts first)
```

## Domain Glossary (PT-BR → EN)
| PT | EN | Notes |
|----|----|-------|
| Fazenda | Farm | Rural property |
| Safra | Harvest/Crop Cycle | Linked to a Fazenda |
| Insumo | Input/Supply | Seeds, fertilizers, etc. |
| Estoque | Inventory/Stock | |
| Fornecedor | Supplier | |
| Cliente | Customer/Buyer | Buys the harvest |
| Receita | Revenue | |
| Despesa | Expense | |
