import { formatCurrency } from "@/lib/utils";
import { getDashboardStats, getFluxoMensal } from "./queries";
import { FluxoChart } from "./fluxo-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, fluxo] = await Promise.all([getDashboardStats(), getFluxoMensal()]);

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

      <div className="mt-6">
        <FluxoChart data={fluxo} />
      </div>
    </div>
  );
}
