"use client";

import { useState } from "react";
import Link from "next/link";
import { avancarSimulacao } from "./actions";
import type { EstadoFrota } from "./queries";
import {
  Radar, LayoutDashboard, MapPin, DollarSign, Play, Loader2,
  AlertTriangle, Fuel, ArrowRightLeft, Users, Map as MapIcon, type LucideIcon,
} from "lucide-react";

const ordemSev = { ALTA: 0, MEDIA: 1, BAIXA: 2 } as const;
const tipoIcon: Record<string, LucideIcon> = {
  REDESPACHO: ArrowRightLeft, FILA_ALTA: Users, ALERTA_CONSUMO: AlertTriangle, ABASTECIMENTO: Fuel,
};
const tipoLabel: Record<string, string> = {
  REDESPACHO: "Redespacho", FILA_ALTA: "Fila Alta", ALERTA_CONSUMO: "Consumo", ABASTECIMENTO: "Combustível",
};
const statusLabel: Record<string, string> = {
  EM_OPERACAO: "Em operação", NA_FILA: "Na fila", EM_TRANSITO: "Em trânsito", OCIOSO: "Ocioso", MANUTENCAO: "Manutenção",
};

export function OperacaoClient({ estado }: { estado: EstadoFrota }) {
  const [pending, setPending] = useState(false);

  async function handleAvancar() {
    setPending(true);
    try { await avancarSimulacao(); } finally { setPending(false); }
  }

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
          Agro<span>Tech</span> · Centro de Operações
          <span className="od-cycle">Ciclo #{estado.tick}</span>
        </div>
        <button className="od-btn" onClick={handleAvancar} disabled={pending}>
          {pending ? <Loader2 size={16} className="od-spin" /> : <Play size={16} />}
          {pending ? "Processando" : "Avançar Simulação"}
        </button>
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
                <div key={r.id} className="od-rec">
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

const css = `
.od-console{position:fixed;inset:0;z-index:40;background:var(--od-bg);color:var(--od-fg);overflow:hidden;
  --od-bg:oklch(14% 0.02 240);--od-surface:oklch(25% 0.04 240 / 0.4);--od-fg:oklch(98% 0.01 240);
  --od-muted:oklch(65% 0.02 240);--od-border:oklch(40% 0.05 240 / 0.4);--od-accent:oklch(85% 0.22 165);
  --od-accent-glow:oklch(85% 0.22 165 / 0.3);--od-red:oklch(65% 0.25 25);--od-red-glow:oklch(65% 0.25 25 / 0.25);
  --od-amber:oklch(75% 0.2 70);--od-amber-glow:oklch(75% 0.2 70 / 0.2);--od-blue:oklch(70% 0.15 240);
  --od-blue-glow:oklch(70% 0.15 240 / 0.2);
  font-family:Inter,system-ui,sans-serif;}
.od-shell{position:relative;z-index:10;display:flex;width:100%;height:100%;}
.od-rail{width:80px;display:flex;flex-direction:column;align-items:center;padding:28px 0;gap:36px;
  border-right:1px solid var(--od-border);background:rgba(10,15,20,0.55);backdrop-filter:blur(8px);}
.od-logo{color:var(--od-accent);font-size:22px;font-weight:800;letter-spacing:.05em;}
.od-nav{display:flex;flex-direction:column;gap:18px;}
.od-navitem{width:46px;height:46px;display:flex;align-items:center;justify-content:center;border-radius:12px;
  color:var(--od-muted);cursor:pointer;transition:all .2s;position:relative;}
.od-navitem.od-active{color:var(--od-accent);background:rgba(0,255,157,.1);}
.od-navitem:hover{color:var(--od-fg);background:rgba(255,255,255,.05);}
.od-navitem::after{content:attr(data-label);position:absolute;left:100%;margin-left:12px;background:var(--od-bg);
  padding:4px 12px;border-radius:6px;font-size:12px;white-space:nowrap;opacity:0;pointer-events:none;
  transition:opacity .2s;border:1px solid var(--od-border);z-index:100;}
.od-navitem:hover::after{opacity:1;}
.od-main{flex:1;display:flex;flex-direction:column;padding:28px;gap:20px;overflow-y:auto;}
.od-topbar{display:flex;justify-content:space-between;align-items:center;}
.od-title{font-size:26px;font-weight:700;letter-spacing:-.02em;display:flex;align-items:center;gap:12px;}
.od-title span{color:var(--od-accent);}
.od-cycle{background:rgba(255,255,255,.05);padding:4px 12px;border-radius:99px;font-family:'JetBrains Mono',monospace;
  font-size:13px;color:var(--od-accent);border:1px solid var(--od-accent-glow);}
.od-btn{display:flex;align-items:center;gap:8px;background:var(--od-accent);color:var(--od-bg);border:none;
  padding:10px 22px;border-radius:14px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;font-size:13px;
  cursor:pointer;transition:all .2s;box-shadow:0 0 20px var(--od-accent-glow);}
.od-btn:hover{transform:translateY(-2px);box-shadow:0 0 30px var(--od-accent);}
.od-btn:disabled{opacity:.6;cursor:default;transform:none;}
.od-spin{animation:od-rot 1s linear infinite;}
@keyframes od-rot{to{transform:rotate(360deg);}}
.od-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;}
.od-panel{background:var(--od-surface);backdrop-filter:blur(16px) saturate(180%);border:1px solid var(--od-border);
  border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,.37);}
.od-kpi{padding:20px;display:flex;flex-direction:column;gap:6px;}
.od-kpilabel{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--od-muted);font-weight:600;}
.od-kpivalue{font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:600;}
.od-kpivalue small{font-size:13px;color:var(--od-muted);}
.od-grid{display:grid;grid-template-columns:2fr 1fr;gap:18px;flex:1;min-height:0;}
.od-col{display:flex;flex-direction:column;min-height:0;}
.od-side{gap:18px;}
.od-panelhead{padding:18px 20px;border-bottom:1px solid var(--od-border);display:flex;justify-content:space-between;align-items:center;}
.od-panelhead h2{font-size:15px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;}
.od-muted{color:var(--od-muted);font-size:12px;}
.od-sm{font-size:11px;}
.od-feed{display:flex;flex-direction:column;padding:14px;gap:10px;overflow-y:auto;}
.od-empty{padding:32px;text-align:center;color:var(--od-muted);font-size:14px;}
.od-rec{padding:14px;background:rgba(255,255,255,.02);border:1px solid var(--od-border);border-radius:14px;
  display:flex;align-items:center;gap:14px;animation:od-slide .3s ease-out;}
@keyframes od-slide{from{opacity:0;transform:translateX(-16px);}to{opacity:1;transform:translateX(0);}}
.od-sev{padding:4px 8px;border-radius:5px;font-size:10px;font-weight:800;text-transform:uppercase;flex-shrink:0;}
.od-sev-ALTA{background:var(--od-red-glow);color:var(--od-red);border:1px solid var(--od-red);}
.od-sev-MEDIA{background:var(--od-amber-glow);color:var(--od-amber);border:1px solid var(--od-amber);}
.od-sev-BAIXA{background:var(--od-blue-glow);color:var(--od-blue);border:1px solid var(--od-blue);}
.od-recicon{color:var(--od-accent);display:flex;}
.od-recbody{flex:1;}
.od-rectipo{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--od-muted);font-weight:600;margin-bottom:2px;}
.od-recmsg{font-size:13.5px;line-height:1.4;}
.od-units{padding:14px;display:flex;flex-direction:column;gap:10px;}
.od-unit{display:flex;justify-content:space-between;align-items:center;}
.od-unitname{font-size:13px;font-weight:500;}
.od-fila{padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;background:rgba(0,255,157,.1);color:var(--od-accent);}
.od-fila-hi{background:var(--od-red-glow);color:var(--od-red);}
.od-fleetwrap{display:flex;flex-direction:column;min-height:0;flex:1;}
.od-fleetscroll{overflow-y:auto;}
.od-fleet{width:100%;border-collapse:collapse;}
.od-fleet td{padding:10px 16px;font-size:12.5px;border-bottom:1px solid rgba(255,255,255,.04);}
.od-mono{font-family:'JetBrains Mono',monospace;}
.od-right{text-align:right;}
.od-status{padding:2px 8px;border-radius:99px;font-size:10.5px;font-weight:600;background:rgba(0,255,157,.08);color:var(--od-accent);}
.od-fuel-low{color:var(--od-red);font-weight:700;}
.od-console ::-webkit-scrollbar{width:6px;}
.od-console ::-webkit-scrollbar-thumb{background:var(--od-border);border-radius:3px;}
`;
