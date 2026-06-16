import { db } from "@/lib/db";
import { getFazendaContext } from "@/lib/fazenda-context";
import { requireOrgId } from "@/lib/session";

export async function getFrotaList() {
  const orgId = await requireOrgId();
  const ctx = getFazendaContext();

  const [ativos, todos] = await Promise.all([
    db.ativo.findMany({
      where: { organizacaoId: orgId, ...(ctx ? { fazendaId: ctx } : {}) },
      include: { fazenda: { select: { nome: true } } },
      orderBy: { identificador: "asc" },
    }),
    db.ativo.findMany({ where: { organizacaoId: orgId }, select: { consumoAtual: true } }),
  ]);

  const media = todos.length ? todos.reduce((s, a) => s + a.consumoAtual, 0) / todos.length : 0;

  return ativos.map((a) => ({
    id: a.id,
    identificador: a.identificador,
    modelo: a.modelo,
    operador: a.operador,
    unidade: a.fazenda?.nome ?? null,
    status: a.status,
    consumoAtual: a.consumoAtual,
    nivelCombustivel: a.nivelCombustivel,
    horasDesdeManutencao: a.horasDesdeManutencao,
    diffPct: media > 0 ? Math.round(((a.consumoAtual - media) / media) * 100) : 0,
  }));
}
