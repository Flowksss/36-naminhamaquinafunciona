import { db } from "@/lib/db";
import { getFazendaContext } from "@/lib/fazenda-context";

const TRILHA_MAX = 15; // pontos de rota por ativo

/**
 * Dados para o mapa: cada ativo com posição atual, unidade, status,
 * consumo, combustível e a trilha recente (rota) de posições GPS.
 */
export async function getMapaFrota() {
  const ctx = getFazendaContext(); // fazenda selecionada (null = todas)

  const ativos = await db.ativo.findMany({
    where: ctx ? { fazendaId: ctx } : undefined,
    include: {
      fazenda: { select: { nome: true } },
      posicoes: { orderBy: { tick: "desc" }, take: TRILHA_MAX },
    },
    orderBy: { identificador: "asc" },
  });

  const fazendas = await db.fazenda.findMany({
    select: { id: true, nome: true, localizacao: true },
  });

  const machines = ativos
    .filter((a) => a.lat != null && a.lng != null)
    .map((a) => ({
      id: a.id,
      identificador: a.identificador,
      tipo: a.tipo,
      status: a.status,
      lat: a.lat as number,
      lng: a.lng as number,
      consumoAtual: a.consumoAtual,
      nivelCombustivel: a.nivelCombustivel,
      unidade: a.fazenda?.nome ?? null,
      // rota em ordem cronológica (antigo -> novo)
      rota: [...a.posicoes].reverse().map((p) => ({ lat: p.lat, lng: p.lng, tick: p.tick })),
    }));

  return { machines, fazendas };
}

export type MapaFrota = Awaited<ReturnType<typeof getMapaFrota>>;
export type Machine = MapaFrota["machines"][number];
