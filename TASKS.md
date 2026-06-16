# CCT SINCRO — Coordenação Multi-Agente

Hackathon · janela de 8h · agentes: **Claude** (Miguel) · **Gemini** (Miguel) · **Codex** (2 colegas)

## Regra de ouro (evita conflito de merge)
1. `git pull` ANTES de começar qualquer tarefa
2. 1 agente = 1 módulo por vez. Nunca dois no mesmo arquivo.
3. Commits pequenos e frequentes. Push assim que o módulo compila.
4. Branch por módulo → push → merge no `main` pelo Miguel.

## Divisão por CAMADA (atual)
| Camada | Dono | Arquivos (NÃO cruzar) |
|--------|------|------------------------|
| **Backend** | Claude | `prisma/schema.prisma`, `src/lib/*`, `*/queries.ts`, `*/actions.ts`, `src/app/api/*`, `middleware.ts` |
| **UI/UX** | Gemini | `*/page.tsx`, `*/*-form.tsx`, `src/components/*`, `globals.css`, `*/layout.tsx`, Tailwind |

**Contrato de interface por módulo:**
- Claude expõe leitura em `queries.ts` e escrita em `actions.ts`
- Gemini só importa dessas funções e renderiza. Nunca chama `db` direto no `page.tsx`.
- Mudou assinatura de uma query/action? Avisa no commit.

### CONTRATO CONGELADO (não mudar sem avisar todo o time)
Tipo compartilhado em `src/lib/types.ts`:
```ts
type FormState = { ok: boolean; errors?: Record<string,string>; message?: string };
const initialFormState: FormState = { ok: false };
```

**Toda Server Action tem esta assinatura:**
```ts
async function criarX(prevState: FormState, formData: FormData): Promise<FormState>
```

**Como a UI (Gemini) consome — padrão fixo (React 18 / Next 14):**
> ⚠️ Projeto é React 18 — NÃO existe `useActionState`. Usar `useFormState` + `useFormStatus` de `react-dom`.
```tsx
"use client";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { initialFormState } from "@/lib/types";
import { criarFazenda } from "./actions";

// pending vem de useFormStatus em um componente FILHO do <form>:
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "..." : "Salvar"}</button>;
}

const [state, formAction] = useFormState(criarFazenda, initialFormState); // 2-tuple, sem isPending
// <form action={formAction}> ... <SubmitButton /> </form>
// erro por campo: state.errors?.nome  ·  sucesso: state.ok === true
```

**Convenção de ROTAS (route group `(dashboard)` NÃO vira segmento de URL):**
- URLs reais são root: `/fazendas`, `/safras`, `/insumos`, `/financeiro`, `/fornecedores`, `/clientes`. Home = `/dashboard`.
- Nav (`layout.tsx`) e `revalidatePath()` usam esses paths root. NÃO usar prefixo `/dashboard/...`.

**Regras do contrato:**
- `revalidatePath()` mora na ACTION (Claude), nunca no form.
- Action valida e retorna `{ ok:false, errors }` — NUNCA dá throw pra erro de validação.
- Input HTML usa `name=` igual à chave de `errors`. Ex: `<input name="nome">` ↔ `errors.nome`.
- Sucesso de criação: action faz `redirect()` OU retorna `{ ok:true }`. Padrão: lista usa redirect, edição inline retorna `ok:true`.

### Ordem de execução (validar antes de fanout)
1. ✅ Contrato congelado (`types.ts`)
2. 🔨 Claude: Fazendas `queries.ts` + `actions.ts` (slice de referência)
3. ⏭️ Gemini: Fazendas form contra o contrato → testar create/list/delete no browser
4. ⏭️ SÓ DEPOIS de provar: replicar para safras, insumos, financeiro, fornecedores, clientes

## Divisão de módulos
Marque `[x]` ao concluir e ponha seu nome.

| Módulo | Pasta | Responsável | Status |
|--------|-------|-------------|--------|
| Fazendas — CRUD | `src/app/(dashboard)/fazendas` | Gemini | [x] lista e form migrados |
| Safras — CRUD | `src/app/(dashboard)/safras` | Gemini | [x] lista migrada, falta form |
| Insumos/Estoque — CRUD + movimento | `src/app/(dashboard)/insumos` | — | [ ] lista pronta, falta form |
| Financeiro — CRUD transações | `src/app/(dashboard)/financeiro` | Gemini | [x] lista e form migrados |
| Fornecedores — CRUD | `src/app/(dashboard)/fornecedores` | — | [ ] lista pronta, falta form |
| Clientes — CRUD | `src/app/(dashboard)/clientes` | — | [ ] lista pronta, falta form |
| Auth — sessão + logout + guard | `src/lib/auth.ts`, `middleware.ts` | — | [ ] login pronto, falta guard |
| Dashboard — gráficos | `src/app/(dashboard)/dashboard` | Gemini | [x] migrado para AgroTech Dark |
| Operação — Simulação | `src/app/(dashboard)/operacao` | Gemini | [x] visual consolidado |

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
Login: `admin@CCT SINCRO.com` / `admin123`
