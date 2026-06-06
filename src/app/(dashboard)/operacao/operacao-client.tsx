"use client";

import type { EstadoFrota } from "./queries";
import { AutoSim } from "@/components/auto-sim";
import {
  AlertTriangle, Fuel, ArrowRightLeft, Users, Wrench, type LucideIcon,
} from "lucide-react";

const ordemSev = { ALTA: 0, MEDIA: 1, BAIXA: 2 } as const;
const tipoIcon: Record<string, LucideIcon> = {
  REDESPACHO: ArrowRightLeft, FILA_ALTA: Users, ALERTA_CONSUMO: AlertTriangle, ABASTECIMENTO: Fuel, MANUTENCAO: Wrench,
};
const tipoLabel: Record<string, string> = {
  REDESPACHO: "Redespacho", FILA_ALTA: "Fila Alta", ALERTA_CONSUMO: "Consumo", ABASTECIMENTO: "Combustível", MANUTENCAO: "Manutenção",
};
const statusLabel: Record<string, string> = {
  EM_OPERACAO: "Em operação", NA_FILA: "Na fila", EM_TRANSITO: "Em trânsito", OCIOSO: "Ocioso", MANUTENCAO: "Manutenção",
};

export function OperacaoClient({ estado }: { estado: EstadoFrota }) {
  const recs = [...estado.recomendacoes].sort(
    (a, b) => ordemSev[a.severidade as keyof typeof ordemSev] - ordemSev[b.severidade as keyof typeof ordemSev]
  );
  const emFila = estado.filaPorUnidade.reduce((s, u) => s + u.fila, 0);
  const consumoMedio = estado.ativos.length
    ? (estado.ativos.reduce((s, a) => s + a.consumoAtual, 0) / estado.ativos.length).toFixed(1)
    : "0";

  return (
    <>
      <header className="od-topbar">
        <div className="od-title">
CCT <span>SINCRO</span> · Centro de Operações
          <span className="od-cycle">Ciclo #{estado.tick}</span>
        </div>
        <AutoSim />
      </header>

      <section className="od-kpis">
        <Kpi label="Ativos" value={String(estado.ativos.length)} />
        <Kpi label="Em Fila" value={String(emFila)} accent={emFila >= 4 ? "amber" : undefined} />
        <Kpi label="Consumo Médio" value={consumoMedio} unit="L/h" />
        <Kpi label="Alertas" value={String(recs.length)} accent={recs.length ? "amber" : undefined} />
      </section>

      <section className="od-grid">
        {/* RECOMENDAÇÕES */}
        <div className="od-panel od-col">
          <div className="od-panelhead">
            <h2>Recomendações em Tempo Real</h2>
            <span className="od-muted">{recs.length} ativas</span>
          </div>
          <div className="od-feed">
            {recs.length === 0 ? (
              <div className="od-empty">Nenhuma recomendação. Avance a simulação para gerar decisões.</div>
            ) : recs.map((r) => {
              const Icon = tipoIcon[r.tipo] ?? AlertTriangle;
              return (
                <div key={r.id} className={`od-rec border-l-4 ${
                  r.severidade === "ALTA" ? "border-l-[var(--od-red)]" : 
                  r.severidade === "MEDIA" ? "border-l-[var(--od-amber)]" : 
                  "border-l-[var(--od-blue)]"
                }`}>
                  <span className={`od-sev od-sev-${r.severidade}`}>{r.severidade}</span>
                  <span className="od-recicon"><Icon size={18} /></span>
                  <div className="od-recbody">
                    <div className="od-rectipo">{tipoLabel[r.tipo]}</div>
                    <div className="od-recmsg">{r.mensagem}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDE */}
        <div className="od-col od-side">
          <div className="od-panel">
            <div className="od-panelhead"><h2>Fila por Unidade</h2></div>
            <div className="od-units">
              {estado.filaPorUnidade.map((u) => (
                <div key={u.id} className="od-unit">
                  <div>
                    <div className="od-unitname">{u.nome}</div>
                    <div className="od-muted od-sm">{u.ativos} ativos</div>
                  </div>
                  <span className={`od-fila ${u.fila >= 4 ? "od-fila-hi" : ""}`}>fila {u.fila}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="od-panel od-fleetwrap">
            <div className="od-panelhead"><h2>Frota ({estado.ativos.length})</h2></div>
            <div className="od-fleetscroll">
              <table className="od-fleet">
                <tbody>
                  {estado.ativos.map((a) => (
                    <tr key={a.id}>
                      <td className="od-mono">{a.identificador}</td>
                      <td><span className="od-status">{statusLabel[a.status]}</span></td>
                      <td className="od-mono od-right">{a.consumoAtual.toFixed(1)}</td>
                      <td className="od-right">
                        <span className={(a.nivelCombustivel ?? 0) < 15 ? "od-fuel-low" : "od-muted"}>
                          {a.nivelCombustivel ?? 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Kpi({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: "amber" }) {
  return (
    <div className="od-panel od-kpi" style={accent === "amber" ? { borderColor: "var(--od-amber)" } : undefined}>
      <span className="od-kpilabel">{label}</span>
      <span className="od-kpivalue" style={accent === "amber" ? { color: "var(--od-amber)" } : undefined}>
        {value}{unit && <small> {unit}</small>}
      </span>
    </div>
  );
}
