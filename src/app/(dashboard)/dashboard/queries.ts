import { db } from "@/lib/db";

export async function getDashboardStats() {
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [fazendas, safras, insumos, transacoes] = await Promise.all([
    db.fazenda.count(),
    db.safra.count({ where: { status: "EM_ANDAMENTO" } }),
    // comparação coluna-a-coluna via field reference (Prisma >=4.3)
    db.insumo.findMany({
      where: { quantidadeEstoque: { lte: db.insumo.fields.estoqueMinimo } },
      select: { id: true },
    }),
    db.transacao.findMany({
      where: { data: { gte: inicioMes } },
      select: { tipo: true, valor: true },
    }),
  ]);

  const receitaMes = transacoes
    .filter((t) => t.tipo === "RECEITA")
    .reduce((acc, t) => acc + t.valor, 0);

  const despesaMes = transacoes
    .filter((t) => t.tipo === "DESPESA")
    .reduce((acc, t) => acc + t.valor, 0);

  return {
    fazendas,
    safras,
    insumosBaixoEstoque: insumos.length,
    receitaMes,
    despesaMes,
  };
}

const PRECO_DIESEL = 6.1; // R$/L (referência)
const HORAS_OPERACAO_DIA = 8;

/**
 * Economia/ROI estimada: combustível desperdiçado vem do consumo acima
 * da média por ativo. Demonstra valor financeiro do produto.
 */
export async function getEconomia() {
  const [ativos, alertas] = await Promise.all([
    db.ativo.findMany({ select: { consumoMedio: true, consumoAtual: true } }),
    db.recomendacao.count({ where: { status: "ATIVA" } }),
  ]);

  const litrosDesperdicioHora = ativos.reduce(
    (acc, a) => acc + Math.max(0, a.consumoAtual - a.consumoMedio),
    0
  );
  const economiaPotencialDia = litrosDesperdicioHora * HORAS_OPERACAO_DIA * PRECO_DIESEL;

  return {
    litrosDesperdicioHora: Number(litrosDesperdicioHora.toFixed(1)),
    economiaPotencialDia: Number(economiaPotencialDia.toFixed(0)),
    economiaPotencialMes: Number((economiaPotencialDia * 22).toFixed(0)),
    alertasAtivos: alertas,
  };
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export type FluxoMensal = { mes: string; receita: number; despesa: number };

/** Receita x Despesa dos últimos 6 meses, para o gráfico do dashboard. */
export async function getFluxoMensal(): Promise<FluxoMensal[]> {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);

  const transacoes = await db.transacao.findMany({
    where: { data: { gte: inicio } },
    select: { tipo: true, valor: true, data: true },
  });

  const buckets: FluxoMensal[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    buckets.push({ mes: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, receita: 0, despesa: 0 });
  }

  for (const t of transacoes) {
    const d = new Date(t.data);
    const idx = buckets.findIndex(
      (_, i) => {
        const ref = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
        return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
      }
    );
    if (idx >= 0) {
      if (t.tipo === "RECEITA") buckets[idx].receita += t.valor;
      else buckets[idx].despesa += t.valor;
    }
  }

  return buckets;
}
