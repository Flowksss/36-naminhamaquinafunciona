# AgroERP — Instruções para Claude Code

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (sem shadcn instalado — use classes diretas conforme `globals.css`)
- Prisma ORM + PostgreSQL (Neon)
- NextAuth.js v4 com Credentials Provider

## Estrutura de pastas
```
src/
  app/
    (dashboard)/        # Route group — sidebar layout aplicado aqui
      dashboard/        # Rota /dashboard
      fazendas/
      safras/
      insumos/
      financeiro/
      fornecedores/
      clientes/
    api/auth/[...nextauth]/
    login/
    globals.css
    layout.tsx          # Root layout
    page.tsx            # Redireciona para /dashboard
  lib/
    db.ts               # Prisma singleton
    auth.ts             # NextAuthOptions
    utils.ts            # cn(), formatCurrency(), formatDate()
prisma/
  schema.prisma         # Schema completo do ERP agro
```

## Modelos Prisma
- `User` — auth, roles: ADMIN | GERENTE | OPERADOR
- `Fazenda` — propriedades rurais
- `Safra` — ciclo de produção (PLANEJADA → EM_ANDAMENTO → COLHIDA)
- `Insumo` — estoque de insumos com alerta de mínimo
- `MovimentoEstoque` — entradas/saídas de insumos
- `Fornecedor` — fornecedores de insumos
- `Cliente` — compradores da produção
- `Transacao` — fluxo de caixa (RECEITA | DESPESA)

## Comandos úteis
```bash
npm install
cp .env.example .env   # Preencha DATABASE_URL e NEXTAUTH_SECRET
npm run db:push        # Aplica schema no banco
npm run db:generate    # Regenera Prisma Client
npm run dev            # Inicia em http://localhost:3000
```

## Padrões de código
- Server Components por padrão; use `"use client"` só quando necessário
- Acesse banco via `import { db } from "@/lib/db"` — nunca instancie PrismaClient direto
- Sem comentários desnecessários
- Formulários: implemente como Server Actions em `actions/` ou como Client Components com fetch para API Routes
- Imports com alias `@/` (configurado em tsconfig)
