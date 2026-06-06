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
  const sim = (await db.simState.findFirst()) ?? (await db.simState.create({ data: { tick: 0 } }));
  const novoTick = sim.tick + 1;

  const ativos = await db.ativo.findMany();

  // evolui cada ativo
  for (const a of ativos) {
    const consumoAtual = Number((a.consumoMedio * rand(0.85, 1.45)).toFixed(1));

    let nivel = (a.nivelCombustivel ?? 100) - rand(3, 14);
    if (nivel < 8 && Math.random() < 0.6) nivel = 100; // abastecido entre ticks
    nivel = Math.max(0, Math.round(nivel));

    // transição de status com viés p/ gerar filas ocasionais
    const r = Math.random();
    let status: (typeof STATUS)[number];
    if (r < 0.4) status = "NA_FILA";
    else if (r < 0.7) status = "EM_OPERACAO";
    else if (r < 0.85) status = "EM_TRANSITO";
    else status = "OCIOSO";

    await db.ativo.update({
      where: { id: a.id },
      data: { consumoAtual, nivelCombustivel: nivel, status },
    });
  }

  // estado atualizado p/ o motor
  const atualizados = await db.ativo.findMany();
  const fazendas = await db.fazenda.findMany({ select: { id: true, nome: true } });

  const estadoAtivos: AtivoEstado[] = atualizados.map((a) => ({
    id: a.id,
    identificador: a.identificador,
    status: a.status,
    fazendaId: a.fazendaId,
    consumoMedio: a.consumoMedio,
    consumoAtual: a.consumoAtual,
    nivelCombustivel: a.nivelCombustivel,
  }));
  const estadoFazendas: FazendaEstado[] = fazendas;

  const recs = gerarRecomendacoes(estadoAtivos, estadoFazendas);

  // substitui recomendações ativas pelas novas
  await db.recomendacao.deleteMany();
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
  return { tick: novoTick, totalRecomendacoes: recs.length };
}
