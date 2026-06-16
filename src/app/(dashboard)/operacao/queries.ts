import { db } from "@/lib/db";
import { getFazendaContext } from "@/lib/fazenda-context";
import { requireOrgId } from "@/lib/session";

export async function getEstadoFrota() {
  const orgId = await requireOrgId(); // isolamento: tudo restrito à org da sessão
  const ctx = getFazendaContext(); // fazenda selecionada dentro da org (null = todas)

  const baseAtivo = { organizacaoId: orgId, ...(ctx ? { fazendaId: ctx } : {}) };

  const [ativos, ativosOrg, fazendas, recomendacoes, sim] = await Promise.all([
    db.ativo.findMany({
      where: baseAtivo,
      include: { fazenda: { select: { nome: true } } },
      orderBy: { identificador: "asc" },
    }),
    db.ativo.findMany({ where: { organizacaoId: orgId }, select: { fazendaId: true, status: true } }),
    db.fazenda.findMany({
      where: { organizacaoId: orgId },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    db.recomendacao.findMany({
      where: {
        organizacaoId: orgId,
        status: "ATIVA",
        ...(ctx ? { OR: [{ fazendaOrigemId: ctx }, { fazendaDestinoId: ctx }] } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    db.simState.findFirst({ where: { organizacaoId: orgId } }),
  ]);

  const unidades = ctx ? fazendas.filter((f) => f.id === ctx) : fazendas;
  const filaPorUnidade = unidades.map((f) => ({
    ...f,
    fila: ativosOrg.filter((a) => a.status === "NA_FILA" && a.fazendaId === f.id).length,
    ativos: ativosOrg.filter((a) => a.fazendaId === f.id).length,
  }));

  return { ativos, fazendas, filaPorUnidade, recomendacoes, tick: sim?.tick ?? 0 };
}

export type EstadoFrota = Awaited<ReturnType<typeof getEstadoFrota>>;
