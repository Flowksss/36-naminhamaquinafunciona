import { db } from "@/lib/db";
import { getFazendaContext } from "@/lib/fazenda-context";
import { requireOrgId } from "@/lib/session";
import { getRecomendacoesAtuais } from "@/lib/fleet/recommend";

export async function getEstadoFrota() {
  const orgId = await requireOrgId(); // isolamento: tudo restrito à org da sessão
  const ctx = getFazendaContext(); // fazenda selecionada dentro da org (null = todas)

  const baseAtivo = { organizacaoId: orgId, ...(ctx ? { fazendaId: ctx } : {}) };

  const [ativos, ativosOrg, fazendas, recsAll] = await Promise.all([
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
    getRecomendacoesAtuais(orgId), // motor calculado ao vivo do estado real
  ]);

  // filtra recomendações pela unidade selecionada (quando houver)
  const recomendacoes = ctx
    ? recsAll.filter((r) => r.fazendaOrigemId === ctx || r.fazendaDestinoId === ctx)
    : recsAll;

  const unidades = ctx ? fazendas.filter((f) => f.id === ctx) : fazendas;
  const filaPorUnidade = unidades.map((f) => ({
    ...f,
    fila: ativosOrg.filter((a) => a.status === "NA_FILA" && a.fazendaId === f.id).length,
    ativos: ativosOrg.filter((a) => a.fazendaId === f.id).length,
  }));

  return { ativos, fazendas, filaPorUnidade, recomendacoes };
}

export type EstadoFrota = Awaited<ReturnType<typeof getEstadoFrota>>;
