# AgroERP — Coordenação Multi-Agente

Hackathon · janela de 8h · agentes: **Claude** (Miguel) · **Gemini** (Miguel) · **Codex** (2 colegas)

## Regra de ouro (evita conflito de merge)
1. `git pull` ANTES de começar qualquer tarefa
2. 1 agente = 1 módulo por vez. Nunca dois no mesmo arquivo.
3. Commits pequenos e frequentes. Push assim que o módulo compila.
4. Branch por módulo → push → merge no `main` pelo Miguel.

## Divisão de módulos
Marque `[x]` ao concluir e ponha seu nome.

| Módulo | Pasta | Responsável | Status |
|--------|-------|-------------|--------|
| Fazendas — CRUD | `src/app/(dashboard)/fazendas` | — | [ ] lista pronta, falta form |
| Safras — CRUD | `src/app/(dashboard)/safras` | — | [ ] lista pronta, falta form |
| Insumos/Estoque — CRUD + movimento | `src/app/(dashboard)/insumos` | — | [ ] lista pronta, falta form |
| Financeiro — CRUD transações | `src/app/(dashboard)/financeiro` | — | [ ] lista pronta, falta form |
| Fornecedores — CRUD | `src/app/(dashboard)/fornecedores` | — | [ ] lista pronta, falta form |
| Clientes — CRUD | `src/app/(dashboard)/clientes` | — | [ ] lista pronta, falta form |
| Auth — sessão + logout + guard | `src/lib/auth.ts`, `middleware.ts` | — | [ ] login pronto, falta guard |
| Dashboard — gráficos | `src/app/(dashboard)/dashboard` | — | [ ] cards prontos |

## Contrato compartilhado (NÃO mexer sem avisar o time)
Arquivos que todos dependem — mudança aqui quebra todo mundo:
- `prisma/schema.prisma` — mudou modelo? avisa + roda `npm run db:push`
- `src/lib/db.ts` · `src/lib/utils.ts` · `src/lib/auth.ts`
- `src/app/(dashboard)/layout.tsx` (sidebar/nav)

## Padrão de CRUD (todos seguem igual)
1. Lista: Server Component, lê via `db` de `@/lib/db` (já feito)
2. Criar/editar: Server Action em `actions.ts` na pasta do módulo
3. `revalidatePath()` após mutação
4. Form: Client Component (`"use client"`) chamando a action

## Setup inicial (quem clonar)
```bash
npm install
# pedir .env ao Miguel (contém DATABASE_URL do Neon)
npm run db:generate
npm run dev
```
Login: `admin@agroerp.com` / `admin123`
