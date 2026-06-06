import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

async function getStats() {
  const [fazendas, safras, insumos, transacoes] = await Promise.all([
    db.fazenda.count(),
    db.safra.count({ where: { status: "EM_ANDAMENTO" } }),
    db.insumo.findMany({ where: { quantidadeEstoque: { lte: db.insumo.fields.estoqueMinimo } } }).catch(() => []),
    db.transacao.findMany({
      where: { data: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }).catch(() => []),
  ]);

  const receitaMes = transacoes
    .filter((t) => t.tipo === "RECEITA")
    .reduce((acc, t) => acc + t.valor, 0);

  const despesaMes = transacoes
    .filter((t) => t.tipo === "DESPESA")
    .reduce((acc, t) => acc + t.valor, 0);

  return { fazendas, safras, insumos: insumos.length, receitaMes, despesaMes };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { title: "Fazendas Cadastradas", value: stats.fazendas, unit: "fazendas" },
    { title: "Safras em Andamento", value: stats.safras, unit: "safras" },
    { title: "Receita do Mês", value: formatCurrency(stats.receitaMes), unit: "" },
    { title: "Despesas do Mês", value: formatCurrency(stats.despesaMes), unit: "" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-card border rounded-lg p-6">
            <p className="text-sm text-muted-foreground">{card.title}</p>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
            {card.unit && <p className="text-xs text-muted-foreground mt-1">{card.unit}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
