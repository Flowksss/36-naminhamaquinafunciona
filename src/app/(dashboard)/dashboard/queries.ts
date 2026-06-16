import { db } from "@/lib/db";
import { getFazendaContext } from "@/lib/fazenda-context";
import { requireOrgId } from "@/lib/session";

const PRECO_DIESEL = 6.1; // R$/L (referência)
const HORAS_OPERACAO_DIA = 8;

async function ativosNoContexto() {
  const orgId = await requireOrgId();
  const ctx = getFazendaContext();
  return db.ativo.findMany({ where: { organizacaoId: orgId, ...(ctx ? { fazendaId: ctx } : {}) } });
}

async function recsNoContexto() {
  const orgId = await requireOrgId();
  const ctx = getFazendaContext();
  return db.recomendacao.findMany({
    where: {
      organizacaoId: orgId,
      status: "ATIVA",
      ...(ctx ? { OR: [{ fazendaOrigemId: ctx }, { fazendaDestinoId: ctx }] } : {}),
    },
  });
}

/** KPIs operacionais do CCT-Sincro (filtra pela fazenda ativa). */
export async function getDashboardStats() {
  const [ativos, recs] = await Promise.all([ativosNoContexto(), recsNoContexto()]);
  return {
    ativos: ativos.length,
    emOperacao: ativos.filter((a) => a.status === "EM_OPERACAO" || a.status === "EM_TRANSITO").length,
    naFila: ativos.filter((a) => a.status === "NA_FILA").length,
    alertas: recs.length,
    manutencoes: recs.filter((r) => r.tipo === "MANUTENCAO").length,
  };
}

/** Economia/ROI estimada (combustível desperdiçado vs média). */
export async function getEconomia() {
  const ativos = await ativosNoContexto();
  const litrosDesperdicioHora = ativos.reduce(
    (acc, a) => acc + Math.max(0, a.consumoAtual - a.consumoMedio),
    0
  );
  const economiaPotencialDia = litrosDesperdicioHora * HORAS_OPERACAO_DIA * PRECO_DIESEL;
  return {
    litrosDesperdicioHora: Number(litrosDesperdicioHora.toFixed(1)),
    economiaPotencialDia: Number(economiaPotencialDia.toFixed(0)),
    economiaPotencialMes: Number((economiaPotencialDia * 22).toFixed(0)),
  };
}

const STATUS_LABEL: Record<string, string> = {
  EM_OPERACAO: "Em operação",
  NA_FILA: "Na fila",
  EM_TRANSITO: "Em trânsito",
  OCIOSO: "Ocioso",
  MANUTENCAO: "Manutenção",
};

export type StatusDist = { status: string; label: string; total: number };

export type SnapshotTrend = {
  tick: number;
  alertas: number;
  manutencoes: number;
  emFila: number;
  desperdicioDia: number;
  consumoTotal: number;
};

/** Tendência ao longo dos últimos N ciclos (gráfico de linha). */
export async function getSnapshots(limit = 15): Promise<SnapshotTrend[]> {
  const orgId = await requireOrgId();
  const snaps = await db.snapshotOperacional.findMany({
    where: { organizacaoId: orgId },
    orderBy: { tick: "desc" },
    take: limit,
    select: { tick: true, alertas: true, manutencoes: true, emFila: true, desperdicioDia: true, consumoTotal: true },
  });
  return snaps.reverse();
}

/** Distribuição de ativos por status (para o gráfico). */
export async function getAtivosPorStatus(): Promise<StatusDist[]> {
  const ativos = await ativosNoContexto();
  return Object.entries(STATUS_LABEL).map(([status, label]) => ({
    status,
    label,
    total: ativos.filter((a) => a.status === status).length,
  }));
}
