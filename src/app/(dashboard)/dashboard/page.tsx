import { getDashboardStats, getEconomia, getAtivosPorStatus, getSnapshots } from "./queries";
import { StatusChart } from "./status-chart";
import { TrendChart } from "./trend-chart";

export const dynamic = "force-dynamic";

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export default async function DashboardPage() {
  const [stats, economia, statusDist, snapshots] = await Promise.all([
    getDashboardStats(),
    getEconomia(),
    getAtivosPorStatus(),
    getSnapshots(),
  ]);

  const cards = [
    { title: "Ativos", value: String(stats.ativos), unit: "na frota", accent: false },
    { title: "Em Operação", value: String(stats.emOperacao), unit: "ativos", accent: false },
    { title: "Alertas Ativos", value: String(stats.alertas), unit: "recomendações", accent: stats.alertas > 0 },
    { title: "Manutenções", value: String(stats.manutencoes), unit: "pendentes", accent: stats.manutencoes > 0 },
  ];

  return (
    <>
      <header className="od-topbar">
        <h1 className="od-title">Dashboard <span>Visão Operacional</span></h1>
      </header>

      <div className="od-kpis mt-4">
        {cards.map((card) => (
          <div key={card.title} className="od-panel od-kpi" style={card.accent ? { borderColor: "var(--od-amber)" } : undefined}>
            <span className="od-kpilabel">{card.title}</span>
            <span className="od-kpivalue" style={card.accent ? { color: "var(--od-amber)" } : undefined}>
              {card.value}
              {card.unit && <small> {card.unit}</small>}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[18px] mt-6">
        {/* Economia / ROI — destaque do pitch */}
        <div className="od-panel p-6 flex flex-col justify-center">
          <span className="od-kpilabel">Economia Potencial / mês</span>
          <span className="od-kpivalue text-[var(--od-accent)]" style={{ fontSize: 32 }}>
            {brl(economia.economiaPotencialMes)}
          </span>
          <p className="od-muted mt-2">
            {economia.litrosDesperdicioHora} L/h acima da média · {brl(economia.economiaPotencialDia)}/dia
          </p>
        </div>

        {/* Distribuição da frota */}
        <div className="od-panel lg:col-span-2">
          <div className="od-panelhead"><h2>Distribuição da Frota</h2></div>
          <div className="p-6">
            <StatusChart data={statusDist} />
          </div>
        </div>
      </div>

      <div className="od-panel mt-6">
        <div className="od-panelhead"><h2>Alertas e Economia por Ciclo</h2></div>
        <div className="p-6">
          <TrendChart data={snapshots} />
        </div>
      </div>
    </>
  );
}
