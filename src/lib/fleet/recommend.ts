import { db } from "@/lib/db";
import { gerarRecomendacoes, type AtivoEstado, type FazendaEstado, type RecomendacaoGerada } from "./engine";

export type RecomendacaoAtual = RecomendacaoGerada & { id: string };

/**
 * Recomendações calculadas AO VIVO a partir do estado real cadastrado das
 * máquinas (sem simulação aleatória). O motor (engine.ts) roda no momento da
 * leitura; nada é persistido. Quando houver telemetria real, esta é a função
 * que passa a consumir o feed.
 */
export async function getRecomendacoesAtuais(orgId: string): Promise<RecomendacaoAtual[]> {
  const [ativos, fazendas] = await Promise.all([
    db.ativo.findMany({ where: { organizacaoId: orgId } }),
    db.fazenda.findMany({ where: { organizacaoId: orgId }, select: { id: true, nome: true } }),
  ]);

  const estado: AtivoEstado[] = ativos.map((a) => ({
    id: a.id,
    identificador: a.identificador,
    status: a.status,
    fazendaId: a.fazendaId,
    consumoMedio: a.consumoMedio,
    consumoAtual: a.consumoAtual,
    nivelCombustivel: a.nivelCombustivel,
    horasDesdeManutencao: a.horasDesdeManutencao,
  }));

  return gerarRecomendacoes(estado, fazendas as FazendaEstado[]).map((r, i) => ({
    ...r,
    id: `rec-${r.tipo}-${r.ativoId ?? r.fazendaOrigemId ?? i}`,
  }));
}
