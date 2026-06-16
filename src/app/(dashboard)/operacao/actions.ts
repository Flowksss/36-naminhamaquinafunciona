"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrgId } from "@/lib/session";
import { gerarRecomendacoes, LIMITE_MANUTENCAO, type AtivoEstado, type FazendaEstado } from "@/lib/fleet/engine";

const PRECO_DIESEL = 6.1; // R$/L
const HORAS_OPERACAO_DIA = 8;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Avança 1 tick da simulação da org da sessão. A evolução do estado é
 * coerente com o motor de regras: manutenção é um estado alcançável
 * (não um sorteio decorativo) e o consumo só dispara alerta em anomalia
 * real, não em ruído. Roda o motor e regenera as recomendações ativas.
 */
export async function avancarSimulacao() {
  const orgId = await requireOrgId();

  const [simExistente, ativos, fazendas] = await Promise.all([
    db.simState.findFirst({ where: { organizacaoId: orgId } }),
    db.ativo.findMany({ where: { organizacaoId: orgId } }),
    db.fazenda.findMany({ where: { organizacaoId: orgId }, select: { id: true, nome: true } }),
  ]);
  const sim = simExistente ?? (await db.simState.create({ data: { organizacaoId: orgId, tick: 0 } }));
  const novoTick = sim.tick + 1;

  const novasPosicoes: { ativoId: string; lat: number; lng: number; consumo: number; nivel: number; tick: number }[] = [];
  const estadoAtivos: AtivoEstado[] = [];
  const updates = [];

  for (const a of ativos) {
    // --- estado operacional: manutenção é dirigida pelo estado, não por sorteio ---
    let status: AtivoEstado["status"];
    let horas = a.horasDesdeManutencao;

    if (a.status === "MANUTENCAO") {
      // em manutenção: conclui com probabilidade; ao concluir, zera as horas
      if (Math.random() < 0.35) {
        status = "OCIOSO";
        horas = 0;
      } else {
        status = "MANUTENCAO";
      }
    } else if (horas >= LIMITE_MANUTENCAO && Math.random() < 0.6) {
      // regra de manutenção preventiva aceita -> ativo entra em manutenção
      status = "MANUTENCAO";
    } else {
      const r = Math.random();
      if (r < 0.4) status = "NA_FILA";
      else if (r < 0.7) status = "EM_OPERACAO";
      else if (r < 0.85) status = "EM_TRANSITO";
      else status = "OCIOSO";
    }

    const operando = status === "EM_OPERACAO" || status === "EM_TRANSITO";

    // horas acumulam só operando; manutenção não acumula (zera ao concluir, acima)
    const ganhoHoras = operando ? rand(8, 20) : 0;
    if (status !== "MANUTENCAO") horas = Math.round(horas + ganhoHoras);
    const horimetro = Math.round(a.horimetroTotal + ganhoHoras);

    // --- consumo: normal perto da média; anomalia real é rara e separável do ruído ---
    let fator: number;
    if (!operando) fator = rand(0.15, 0.4); // ocioso/fila/manutenção: queima baixa, não alerta
    else if (Math.random() < 0.08) fator = rand(1.25, 1.6); // anomalia real (~8% dos ticks operando)
    else fator = rand(0.92, 1.12); // operação normal, sempre abaixo da tolerância de 20%
    const consumoAtual = Number((a.consumoMedio * fator).toFixed(1));

    let nivel = (a.nivelCombustivel ?? 100) - rand(3, 14) * (operando ? 1 : 0.25);
    if (nivel < 8 && Math.random() < 0.6) nivel = 100; // abastecido entre ticks
    nivel = clamp(Math.round(nivel), 0, 100);

    const movel = operando;
    const passo = movel ? 0.04 : 0.005;
    const lat = Number(((a.lat ?? -13) + rand(-passo, passo)).toFixed(5));
    const lng = Number(((a.lng ?? -56) + rand(-passo, passo)).toFixed(5));

    updates.push(
      db.ativo.update({
        where: { id: a.id },
        data: { consumoAtual, nivelCombustivel: nivel, status, lat, lng, horasDesdeManutencao: horas, horimetroTotal: horimetro },
      })
    );
    novasPosicoes.push({ ativoId: a.id, lat, lng, consumo: consumoAtual, nivel, tick: novoTick });
    estadoAtivos.push({
      id: a.id,
      identificador: a.identificador,
      status,
      fazendaId: a.fazendaId,
      consumoMedio: a.consumoMedio,
      consumoAtual,
      nivelCombustivel: nivel,
      horasDesdeManutencao: horas,
    });
  }

  const recs = gerarRecomendacoes(estadoAtivos, fazendas as FazendaEstado[]);

  // snapshot agregado do ciclo (para tendência) — desperdício honesto: R$ acima da média
  const consumoTotal = estadoAtivos.reduce((s, a) => s + a.consumoAtual, 0);
  const desperdicioDia =
    estadoAtivos.reduce((s, a) => s + Math.max(0, a.consumoAtual - a.consumoMedio), 0) *
    HORAS_OPERACAO_DIA *
    PRECO_DIESEL;
  const snapshot = {
    organizacaoId: orgId,
    tick: novoTick,
    totalAtivos: estadoAtivos.length,
    emFila: estadoAtivos.filter((a) => a.status === "NA_FILA").length,
    emOperacao: estadoAtivos.filter((a) => a.status === "EM_OPERACAO" || a.status === "EM_TRANSITO").length,
    alertas: recs.length,
    manutencoes: estadoAtivos.filter((a) => a.status === "MANUTENCAO").length,
    consumoTotal: Number(consumoTotal.toFixed(1)),
    desperdicioDia: Number(desperdicioDia.toFixed(0)),
  };

  // escritas independentes em paralelo; recomendações da org são RESOLVIDAS (não apagadas)
  await Promise.all([
    ...updates,
    db.posicaoGPS.createMany({ data: novasPosicoes }),
    db.recomendacao.updateMany({
      where: { organizacaoId: orgId, status: "ATIVA" },
      data: { status: "RESOLVIDA" },
    }),
    db.snapshotOperacional.create({ data: snapshot }),
  ]);
  if (recs.length > 0) {
    await db.recomendacao.createMany({
      data: recs.map((r) => ({
        organizacaoId: orgId,
        tick: novoTick,
        tipo: r.tipo,
        severidade: r.severidade,
        mensagem: r.mensagem,
        ativoId: r.ativoId ?? null,
        fazendaOrigemId: r.fazendaOrigemId ?? null,
        fazendaDestinoId: r.fazendaDestinoId ?? null,
      })),
    });
  }

  await db.simState.update({ where: { id: sim.id }, data: { tick: novoTick } });

  revalidatePath("/operacao");
  revalidatePath("/mapa");
  revalidatePath("/dashboard");
  revalidatePath("/planos");
  return { tick: novoTick, totalRecomendacoes: recs.length };
}
