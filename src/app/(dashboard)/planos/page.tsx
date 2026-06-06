import { getPlanoInfo } from "./queries";
import { Check, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export default async function PlanosPage() {
  const { totalAtivos, planoAtualId, limiteAtual, planos } = await getPlanoInfo();
  const uso = Math.min(100, Math.round((totalAtivos / limiteAtual) * 100));

  return (
    <>
      <header className="od-topbar">
        <h1 className="od-title">Planos <span>Assinatura por Ativos</span></h1>
      </header>

      {/* uso atual */}
      <div className="od-panel p-6 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-[var(--od-accent)]" />
            <span className="od-kpilabel">Ativos registrados</span>
          </div>
          <span className="od-mono text-sm">
            <span className="text-[var(--od-fg)] font-bold">{totalAtivos}</span>
            <span className="od-muted"> / {limiteAtual}</span>
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${uso}%`, background: uso >= 90 ? "var(--od-red)" : "var(--od-accent)" }}
          />
        </div>
      </div>

      {/* cards de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mt-6">
        {planos.map((p) => {
          const atual = p.id === planoAtualId;
          return (
            <div
              key={p.id}
              className="od-panel p-6 flex flex-col gap-4 relative"
              style={atual ? { borderColor: "var(--od-accent)", boxShadow: "0 0 24px var(--od-accent-glow)" } : undefined}
            >
              {atual && (
                <span className="absolute -top-2.5 left-6 od-badge od-badge-accent">Plano atual</span>
              )}
              {p.destaque && !atual && (
                <span className="absolute -top-2.5 left-6 od-badge">Mais popular</span>
              )}
              <div>
                <h2 className="text-xl font-bold">{p.nome}</h2>
                <p className="od-muted">Até {p.limite} ativos</p>
              </div>
              <div className="od-mono">
                <span className="text-3xl font-bold text-[var(--od-accent)]">{brl(p.preco)}</span>
                <span className="od-muted text-sm"> /mês</span>
              </div>
              <ul className="space-y-2 text-sm flex-1">
                <Feat>Motor de decisão em tempo real</Feat>
                <Feat>Mapa GPS + rotas</Feat>
                <Feat>Alertas de consumo e manutenção</Feat>
                <Feat>Multiunidade</Feat>
                {p.id !== "START" && <Feat>Relatórios avançados</Feat>}
                {p.id === "ENTERPRISE" && <Feat>Integração com telemetria</Feat>}
              </ul>
              <button
                className={atual ? "od-btn od-btn-secondary w-full justify-center" : "od-btn w-full justify-center"}
                disabled={atual}
              >
                {atual ? "Plano atual" : "Selecionar"}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Feat({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check size={15} className="text-[var(--od-accent)] shrink-0" />
      <span>{children}</span>
    </li>
  );
}
