import { db } from "@/lib/db";
import { getFazendaContext } from "@/lib/fazenda-context";

export async function getEstadoFrota() {
  const ctx = getFazendaContext(); // fazenda selecionada (null = todas)

  const [ativosAll, fazendas, recsAll, sim] = await Promise.all([
    db.ativo.findMany({ include: { fazenda: { select: { nome: true } } }, orderBy: { identificador: "asc" } }),
    db.fazenda.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
    db.recomendacao.findMany({ where: { status: "ATIVA" }, orderBy: { createdAt: "desc" } }),
    db.simState.findFirst(),
  ]);

  // filtra por fazenda quando selecionada
  const ativos = ctx ? ativosAll.filter((a) => a.fazendaId === ctx) : ativosAll;
  const recomendacoes = ctx
    ? recsAll.filter((r) => r.fazendaOrigemId === ctx || r.fazendaDestinoId === ctx)
    : recsAll;
  const unidades = ctx ? fazendas.filter((f) => f.id === ctx) : fazendas;

  const filaPorUnidade = unidades.map((f) => ({
    ...f,
    fila: ativosAll.filter((a) => a.status === "NA_FILA" && a.fazendaId === f.id).length,
    ativos: ativosAll.filter((a) => a.fazendaId === f.id).length,
  }));

  return { ativos, fazendas, filaPorUnidade, recomendacoes, tick: sim?.tick ?? 0 };
}

export type EstadoFrota = Awaited<ReturnType<typeof getEstadoFrota>>;
