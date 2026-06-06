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
