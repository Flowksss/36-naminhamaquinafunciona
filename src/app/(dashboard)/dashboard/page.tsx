import { formatCurrency } from "@/lib/utils";
import { getDashboardStats, getFluxoMensal, getEconomia } from "./queries";
import { FluxoChart } from "./fluxo-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, fluxo, economia] = await Promise.all([
    getDashboardStats(),
    getFluxoMensal(),
    getEconomia()
  ]);

  const cards = [
    { title: "Fazendas Cadastradas", value: stats.fazendas, unit: "fazendas" },
    { title: "Safras em Andamento", value: stats.safras, unit: "safras" },
    { title: "Receita do Mês", value: formatCurrency(stats.receitaMes), unit: "" },
    { title: "Despesas do Mês", value: formatCurrency(stats.despesaMes), unit: "" },
  ];

  const roiCards = [
    { title: "Desperdício Atual", value: economia.litrosDesperdicioHora, unit: "L/h" },
    { title: "Economia Diária", value: formatCurrency(economia.economiaPotencialDia), unit: "" },
    { title: "Economia Potencial/mês", value: formatCurrency(economia.economiaPotencialMes), unit: "" },
    { title: "Alertas Ativos", value: economia.alertasAtivos, unit: "recomendações" },
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

      <div className="mt-8 mb-4 px-2">
        <h2 className="text-xl font-bold text-[#F3F4F6] flex items-center gap-2">
          Eficiência da Frota <span className="text-[#3b82f6]">| ROI</span>
        </h2>
      </div>
      
      <div className="od-kpis">
        {roiCards.map((card) => (
          <div key={card.title} className="od-panel od-kpi" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <span className="od-kpilabel">{card.title}</span>
            <span className="od-kpivalue text-[#3b82f6]">
              {card.value}
              {card.unit && <small className="text-[#9CA3AF]"> {card.unit}</small>}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 od-panel">
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
