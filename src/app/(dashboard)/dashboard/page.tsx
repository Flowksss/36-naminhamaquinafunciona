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
    <>
      <header className="od-topbar">
        <h1 className="od-title">Dashboard <span>Visão Geral</span></h1>
      </header>
      
      <div className="od-kpis mt-4">
        {cards.map((card) => (
          <div key={card.title} className="od-panel od-kpi">
            <span className="od-kpilabel">{card.title}</span>
            <span className="od-kpivalue">
              {card.value}
              {card.unit && <small> {card.unit}</small>}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 od-panel">
        <div className="od-panelhead">
          <h2>Fluxo de Caixa</h2>
        </div>
        <div className="p-6">
          <FluxoChart data={fluxo} />
        </div>
      </div>
    </>
  );
}
