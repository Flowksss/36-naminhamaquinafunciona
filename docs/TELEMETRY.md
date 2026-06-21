# Arquitetura de Telemetria — CCT SINCRO

Como o dado de campo (consumo, combustível, posição, horas) entra no app e vira
recomendação. Projetado para trocar a fonte (manual → simulador → API OEM real)
**sem mexer no resto do app**.

## Visão geral

```
  Fonte de telemetria            Ingestão              Motor              UI
  ─────────────────────         ──────────         ────────────        ────────
  ManualProvider      ┐
  SimulatorProvider   ├─► LeituraTelemetria ─► aplicarLeitura ─► (Ativo vivo) ─► getRecomendacoesAtuais ─► /operacao
  Leaf/JD/CNH (futuro)┘        (provider.ts)       (ingest.ts)        no banco         (recommend.ts)         /dashboard /mapa
```

Tudo gira em torno de **um contrato** (`TelemetryProvider`) e **um seam de
escrita** (`aplicarLeitura`). Trocar de fonte = implementar o contrato.

## Componentes (`src/lib/telemetry/` e `src/lib/fleet/`)

| Arquivo | Papel |
|---------|-------|
| `telemetry/provider.ts` | Contrato `TelemetryProvider` + tipo `LeituraTelemetria`. `manualProvider` (no-op de poll). |
| `telemetry/ingest.ts` | `aplicarLeitura(orgId, leitura)` — **único** write path. Atualiza campos vivos do Ativo (consumo/combustível/posição/horas) + `ultimaLeitura` e grava `PosicaoGPS`. Org-scoped (anti-IDOR). |
| `telemetry/simulator-provider.ts` | Primeira implementação real: consome o **CCT SimWorld** (`/api/world`) e mapeia `externalId` → `Ativo`. |
| `telemetry/sync.ts` | `sincronizarOrg(orgId)` (uma org) e `sincronizarTodos()` (cron, todas). Rota tudo por `aplicarLeitura`. |
| `fleet/engine.ts` | Motor de regras puro (fila, consumo, combustível, manutenção). Sem DB. |
| `fleet/recommend.ts` | `getRecomendacoesAtuais(orgId)` — roda o motor **ao vivo** sobre o estado real no momento da leitura. Nada persistido. |

## Princípios

- **`consumoMedio` é baseline fixo** (spec da máquina). A telemetria mexe em
  `consumoAtual`, nunca no baseline — senão a anomalia some no próprio baseline.
  Máquinas ligadas ao simulador recebem `consumoMedio` = consumo normal da
  máquina equivalente, para o alerta disparar só na anomalia.
- **Isolamento por org**: `aplicarLeitura` valida que o Ativo é do tenant; toda
  leitura de tenant filtra por `organizacaoId` da sessão.
- **Sem simulação aleatória dentro do app**: o que evolui o estado é dado que
  flui de um provider, não `Math.random()`.

## Como adicionar um provider real (Leaf / John Deere / CNH)

1. Implemente `TelemetryProvider` em `src/lib/telemetry/<nome>-provider.ts`:
   ```ts
   export const leafProvider: TelemetryProvider = {
     nome: "Leaf",
     async fetchLeituras(orgId) {
       // 1. buscar credenciais/máquinas do tenant (externalId)
       // 2. chamar a API (OAuth/Bearer)
       // 3. mapear cada máquina -> LeituraTelemetria { ativoId, consumoAtual, ... }
     },
   };
   ```
2. Ligue no `sync.ts` (escolher provider por `provedorTelemetria` do Ativo).
3. Adicione os campos de credencial/onboarding (token por org).
4. **Nada mais muda** — ingestão, motor e UI seguem iguais.

## SimWorld (mundo de simulação)

Projeto separado (`../cct-simworld`, porta 3100) que expõe máquinas virtuais com
física real no formato das APIs OEM (John Deere `/machines`, CNH `/snapshots`)
+ um feed unificado `/api/world` (estilo Leaf). O `SimulatorProvider` consome o
feed unificado. Marque uma máquina com **Fonte = SimWorld** e **ID externo =
M-001** no cadastro, e use **Sincronizar telemetria** (em /frota ou /operação).

## Sincronização

- **Manual**: botão "Sincronizar telemetria" (/frota) ou o toggle em /operação
  (Auto = poll a cada 5s).
- **Automática (prod)**: `GET /api/cron/telemetry` (protegido por `CRON_SECRET`).
  Para ativar no Vercel Cron, adicione ao `vercel.json` (só após o SimWorld estar
  hospedado num host alcançável):
  ```json
  { "crons": [{ "path": "/api/cron/telemetry", "schedule": "*/10 * * * *" }] }
  ```

## Variáveis de ambiente

| Var | Uso |
|-----|-----|
| `SIMWORLD_URL` | Base do SimWorld (default `http://localhost:3100`). Em prod, host persistente. |
| `CRON_SECRET` | Segredo do job de Cron de telemetria. |

## Roadmap

- **Fase 1 (feito)**: SimulatorProvider + sync manual/auto.
- **Fase 2**: provider Leaf (multimarca) com onboarding de credenciais por org.
- **Fase 3**: latência de cache OEM (1–15 min) no feed + vetor cinemático
  preditivo no CCT ("Waze agrícola"). Só faz sentido depois do mapa virar
  client-side com auto-refresh e do feed simular o atraso real.
