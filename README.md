<div align="center">

# 🛰️ CCT SINCRO

### Inteligência Operacional para o Agronegócio

*Transformar dados operacionais em eficiência, previsibilidade e economia para toda a cadeia do agro.*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)](https://neon.tech/)

</div>

---

## 🎬 Pitch & Demo

- 🎥 **Vídeo do pitch:** **[assistir](https://youtube.com/shorts/pXcXh9sEGbU)**
- 📊 **Apresentação:** **[ver slides](https://docs.google.com/presentation/d/109nfhGiJbA4IHQY1wOEdpcRBxKiDheUOkE26RudHEt0/edit?usp=sharing)**
- 🚀 **App ao vivo:** **[36-na-minha-maquina-funciona.vercel.app](https://36-na-minha-maquina-funciona.vercel.app)**

> Acesso demo: `admin@agroerp.com` / `admin123`

---

## 🌾 O Problema

> *O agronegócio perde dinheiro todos os dias sem perceber.* Ativos parados, combustível desperdiçado e decisões tomadas no escuro. O problema não é a falta de dados — é a falta de **inteligência** para transformá-los em decisões.

**Os 4 gargalos que drenam a operação:**

| Gargalo | Impacto |
|---------|---------|
| 🚜 **Ativos parados** | Falta de sincronização gera ociosidade e reduz capacidade produtiva |
| ⛽ **Combustível acima do esperado** | Consumo sem monitoramento = desperdício silencioso |
| 📡 **Sem visibilidade em tempo real** | Decisões sem dados atualizados geram retrabalho e perdas logísticas |
| 🔧 **Falhas mecânicas** | Manutenção reativa custa até 3x mais do que a preventiva |

## 💡 A Solução

**CCT SINCRO** é uma plataforma SaaS que integra **logística, consumo de combustível, localização de ativos e manutenção preventiva** — usando a telemetria já existente na operação, sem exigir novos equipamentos.

O **motor de decisão** analisa o estado da frota em tempo real e gera recomendações acionáveis:

- 🔄 **Recomenda movimentação de ativos** (redespacho)
- 🚦 **Detecta gargalos operacionais** (filas)
- 📉 **Identifica anomalias de consumo**
- 🔧 **Apoia decisões de manutenção**

---

## ✨ Funcionalidades

- **Centro de Operações** — motor de regras ao vivo; o botão *Avançar Simulação* evolui o estado da frota e regenera as recomendações em tempo real.
- **Mapa GPS** — visualização de posição e rotas dos ativos, com detalhe por máquina (status, consumo, combustível).
- **Dashboard Operacional** — KPIs de frota + projeção de **economia/ROI** + distribuição de ativos por status.
- **Multiunidade** — login seleciona a fazenda (ou *Todas*); toda visualização filtra pelo contexto.
- **Manutenção Preventiva** — acompanhamento de horas por ativo e alerta antes da falha.

---

## 🧠 Como Funciona

```
Ativos em Campo  →  GPS / Telemetria  →  CCT SINCRO  →  Alertas e Recomendações
```

O **motor de regras** (`src/lib/fleet/engine.ts`) é uma função pura que avalia o estado da frota e dispara recomendações por severidade:

| Regra | Gatilho |
|-------|---------|
| Fila Alta / Redespacho | fila ≥ 4 ativos numa unidade |
| Alerta de Consumo | consumo > 20% acima da média do ativo |
| Abastecimento | combustível < 15% |
| Manutenção | ≥ 250h de operação desde a última manutenção |

> No MVP, os dados chegam por **entrada manual + feed GPS simulado** (endpoint de ingestão pronto). A telemetria real (Sascar, Autotrac, etc.) é roadmap.

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + tema dark "glass" + WebGL shader |
| Banco | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials) |
| Gráficos | Recharts |
| Deploy | Vercel |

---

## 🏆 Hackathon

Projeto desenvolvido em hackathon. Construído com colaboração multi-agente (Claude Code, Gemini).

<div align="center">

**CCT SINCRO** — Sincronização, Eficiência e Inteligência para o Agro.

</div>
