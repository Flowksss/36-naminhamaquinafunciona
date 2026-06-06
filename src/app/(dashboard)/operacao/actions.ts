"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { gerarRecomendacoes, type AtivoEstado, type FazendaEstado } from "@/lib/fleet/engine";

const STATUS = ["EM_OPERACAO", "NA_FILA", "EM_TRANSITO", "OCIOSO"] as const;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * Avança 1 tick da simulação: evolui o estado da frota (feed simulado),
 * roda o motor de regras e regenera as recomendações ativas.
 */
export async function avancarSimulacao() {
  const [simExistente, ativos, fazendas] = await Promise.all([
    db.simState.findFirst(),
    db.ativo.findMany(),
    db.fazenda.findMany({ select: { id: true, nome: true } }),
  ]);
  const sim = simExistente ?? (await db.simState.create({ data: { tick: 0 } }));
  const novoTick = sim.tick + 1;

  const novasPosicoes: { ativoId: string; lat: number; lng: number; tick: number }[] = [];
  const estadoAtivos: AtivoEstado[] = [];
  const updates = [];

  // evolui cada ativo (em memória); updates disparados em paralelo depois
  for (const a of ativos) {
    const consumoAtual = Number((a.consumoMedio * rand(0.85, 1.45)).toFixed(1));

    let nivel = (a.nivelCombustivel ?? 100) - rand(3, 14);
    if (nivel < 8 && Math.random() < 0.6) nivel = 100; // abastecido entre ticks
    nivel = Math.max(0, Math.round(nivel));

    const r = Math.random();
    let status: (typeof STATUS)[number];
    if (r < 0.4) status = "NA_FILA";
    else if (r < 0.7) status = "EM_OPERACAO";
    else if (r < 0.85) status = "EM_TRANSITO";
    else status = "OCIOSO";

    const movel = status === "EM_OPERACAO" || status === "EM_TRANSITO";
    const passo = movel ? 0.04 : 0.005;
    const lat = Number(((a.lat ?? -13) + rand(-passo, passo)).toFixed(5));
    const lng = Number(((a.lng ?? -56) + rand(-passo, passo)).toFixed(5));

    let horas = a.horasDesdeManutencao + (movel ? rand(8, 20) : 0);
    if (horas > 360 && Math.random() < 0.5) horas = 0; // manutenção realizada
    horas = Math.round(horas);

    updates.push(
      db.ativo.update({
        where: { id: a.id },
        data: { consumoAtual, nivelCombustivel: nivel, status, lat, lng, horasDesdeManutencao: horas },
      })
    );
    novasPosicoes.push({ ativoId: a.id, lat, lng, tick: novoTick });
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

  // snapshot agregado do ciclo (para tendência)
  const consumoTotal = estadoAtivos.reduce((s, a) => s + a.consumoAtual, 0);
  const economiaDia = estadoAtivos.reduce((s, a) => s + Math.max(0, a.consumoAtual - a.consumoMedio), 0) * 8 * 6.1;
  const snapshot = {
    tick: novoTick,
    totalAtivos: estadoAtivos.length,
    emFila: estadoAtivos.filter((a) => a.status === "NA_FILA").length,
    emOperacao: estadoAtivos.filter((a) => a.status === "EM_OPERACAO" || a.status === "EM_TRANSITO").length,
    alertas: recs.length,
    manutencoes: recs.filter((r) => r.tipo === "MANUTENCAO").length,
    consumoTotal: Number(consumoTotal.toFixed(1)),
    economiaDia: Number(economiaDia.toFixed(0)),
  };

  // todas as escritas independentes em paralelo
  await Promise.all([
    ...updates,
    db.posicaoGPS.createMany({ data: novasPosicoes }),
    db.recomendacao.deleteMany(),
    db.snapshotOperacional.create({ data: snapshot }),
  ]);
  if (recs.length > 0) {
    await db.recomendacao.createMany({
      data: recs.map((r) => ({
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
