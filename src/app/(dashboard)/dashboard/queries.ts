import { db } from "@/lib/db";
import { getFazendaContext } from "@/lib/fazenda-context";

const PRECO_DIESEL = 6.1; // R$/L (referência)
const HORAS_OPERACAO_DIA = 8;

async function ativosNoContexto() {
  const ctx = getFazendaContext();
  return db.ativo.findMany({ where: ctx ? { fazendaId: ctx } : undefined });
}

async function recsNoContexto() {
  const ctx = getFazendaContext();
  const recs = await db.recomendacao.findMany({ where: { status: "ATIVA" } });
  return ctx ? recs.filter((r) => r.fazendaOrigemId === ctx || r.fazendaDestinoId === ctx) : recs;
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

/** Distribuição de ativos por status (para o gráfico). */
export async function getAtivosPorStatus(): Promise<StatusDist[]> {
  const ativos = await ativosNoContexto();
  return Object.entries(STATUS_LABEL).map(([status, label]) => ({
    status,
    label,
    total: ativos.filter((a) => a.status === status).length,
  }));
}
