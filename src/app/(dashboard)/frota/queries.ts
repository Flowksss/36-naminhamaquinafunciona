import { db } from "@/lib/db";
import { requireOrgId } from "@/lib/session";
import { getFazendaContext } from "@/lib/fazenda-context";

export async function getFrotaPageData() {
  const orgId = await requireOrgId();
  const ctx = getFazendaContext();

  const [ativos, fazendas] = await Promise.all([
    db.ativo.findMany({
      where: { organizacaoId: orgId, ...(ctx ? { fazendaId: ctx } : {}) },
      include: { fazenda: { select: { nome: true } } },
      orderBy: { identificador: "asc" },
    }),
    db.fazenda.findMany({ where: { organizacaoId: orgId }, select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  return {
    fazendas,
    ativos: ativos.map((a) => ({
      id: a.id,
      identificador: a.identificador,
      modelo: a.modelo,
      operador: a.operador,
      tipo: a.tipo,
      status: a.status,
      fazendaId: a.fazendaId,
      unidade: a.fazenda?.nome ?? null,
      consumoMedio: a.consumoMedio,
      consumoAtual: a.consumoAtual,
      capacidadeTanque: a.capacidadeTanque,
      nivelCombustivel: a.nivelCombustivel,
      horasDesdeManutencao: a.horasDesdeManutencao,
      ano: a.ano,
      lat: a.lat,
      lng: a.lng,
    })),
  };
}

export type FrotaPageData = Awaited<ReturnType<typeof getFrotaPageData>>;
export type AtivoItem = FrotaPageData["ativos"][number];
export type UnidadeOpcao = FrotaPageData["fazendas"][number];
