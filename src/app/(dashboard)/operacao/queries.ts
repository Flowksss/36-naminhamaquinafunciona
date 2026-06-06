import { db } from "@/lib/db";

export async function getEstadoFrota() {
  const [ativos, fazendas, recomendacoes, sim] = await Promise.all([
    db.ativo.findMany({ include: { fazenda: { select: { nome: true } } }, orderBy: { identificador: "asc" } }),
    db.fazenda.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
    db.recomendacao.findMany({ where: { status: "ATIVA" }, orderBy: { createdAt: "desc" } }),
    db.simState.findFirst(),
  ]);

  // contagem de fila por unidade
  const filaPorUnidade = fazendas.map((f) => ({
    ...f,
    fila: ativos.filter((a) => a.status === "NA_FILA" && a.fazendaId === f.id).length,
    ativos: ativos.filter((a) => a.fazendaId === f.id).length,
  }));

  return { ativos, fazendas, filaPorUnidade, recomendacoes, tick: sim?.tick ?? 0 };
}

export type EstadoFrota = Awaited<ReturnType<typeof getEstadoFrota>>;
