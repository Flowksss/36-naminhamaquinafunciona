"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import { GripVertical, X, Plus, RotateCcw } from "lucide-react";
import type { PainelData } from "./queries";
import { StatusChart } from "../dashboard/status-chart";
import { TrendChart } from "../dashboard/trend-chart";

type Layout = { i: string; x: number; y: number; w: number; h: number };
const Grid = (GridLayout as unknown as { WidthProvider: (c: unknown) => React.ComponentType<Record<string, unknown>> }).WidthProvider(GridLayout);

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

type BlocoDef = {
  id: string;
  titulo: string;
  w: number;
  h: number;
  render: (d: PainelData) => React.ReactNode;
};

const BLOCOS: BlocoDef[] = [
  {
    id: "kpis", titulo: "Indicadores", w: 12, h: 2,
    render: (d) => (
      <div className="grid grid-cols-4 gap-3 h-full">
        {[
          { l: "Ativos", v: d.stats.ativos },
          { l: "Em Operação", v: d.stats.emOperacao },
          { l: "Alertas", v: d.stats.alertas },
          { l: "Manutenções", v: d.stats.manutencoes },
        ].map((k) => (
          <div key={k.l} className="flex flex-col justify-center">
            <span className="od-kpilabel">{k.l}</span>
            <span className="od-kpivalue" style={{ fontSize: 24 }}>{k.v}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "economia", titulo: "Economia / mês", w: 4, h: 3,
    render: (d) => (
      <div className="flex flex-col justify-center h-full">
        <span className="od-kpivalue text-[var(--od-accent)]" style={{ fontSize: 30 }}>
          {brl(d.economia.economiaPotencialMes)}
        </span>
        <p className="od-muted mt-1">{d.economia.litrosDesperdicioHora} L/h acima da média</p>
      </div>
    ),
  },
  {
    id: "status", titulo: "Distribuição da Frota", w: 8, h: 4,
    render: (d) => <StatusChart data={d.statusDist} />,
  },
  {
    id: "trend", titulo: "Alertas e Economia por Ciclo", w: 12, h: 4,
    render: (d) => <TrendChart data={d.snapshots} />,
  },
  {
    id: "recomendacoes", titulo: "Recomendações", w: 6, h: 5,
    render: (d) => (
      <div className="flex flex-col gap-2 overflow-y-auto h-full">
        {d.frota.recomendacoes.slice(0, 8).map((r) => (
          <div key={r.id} className={`od-rec border-l-4 ${
            r.severidade === "ALTA" ? "border-l-[var(--od-red)]" : r.severidade === "MEDIA" ? "border-l-[var(--od-amber)]" : "border-l-[var(--od-blue)]"
          }`}>
            <span className={`od-sev od-sev-${r.severidade}`}>{r.severidade}</span>
            <div className="od-recmsg text-xs">{r.mensagem}</div>
          </div>
        ))}
        {d.frota.recomendacoes.length === 0 && <div className="od-empty">Sem recomendações ativas.</div>}
      </div>
    ),
  },
  {
    id: "frota", titulo: "Frota", w: 6, h: 5,
    render: (d) => (
      <div className="overflow-y-auto h-full">
        <table className="od-fleet">
          <tbody>
            {d.frota.ativos.map((a) => (
              <tr key={a.id}>
                <td className="od-mono">{a.identificador}</td>
                <td><span className="od-status">{a.status}</span></td>
                <td className="od-right od-mono">{a.consumoAtual.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "plano", titulo: "Plano", w: 4, h: 3,
    render: (d) => (
      <div className="flex flex-col justify-center h-full">
        <span className="od-kpivalue" style={{ fontSize: 22 }}>{d.plano.planoAtualId}</span>
        <p className="od-muted mt-1">{d.plano.totalAtivos} / {d.plano.limiteAtual} ativos</p>
      </div>
    ),
  },
];

const DEFAULT_BLOCOS = ["kpis", "status", "trend"];
const LS_BLOCOS = "cct_painel_blocos";
const LS_LAYOUT = "cct_painel_layout";

function layoutPadrao(ids: string[]): Layout[] {
  let y = 0;
  return ids.map((id) => {
    const def = BLOCOS.find((b) => b.id === id)!;
    const item = { i: id, x: 0, y, w: def.w, h: def.h };
    y += def.h;
    return item;
  });
}

export function PainelClient({ data }: { data: PainelData }) {
  const [ativos, setAtivos] = useState<string[]>(DEFAULT_BLOCOS);
  const [layout, setLayout] = useState<Layout[]>(layoutPadrao(DEFAULT_BLOCOS));
  const [montado, setMontado] = useState(false);

  // carrega do localStorage
  useEffect(() => {
    try {
      const b = localStorage.getItem(LS_BLOCOS);
      const l = localStorage.getItem(LS_LAYOUT);
      if (b) setAtivos(JSON.parse(b));
      if (l) setLayout(JSON.parse(l));
    } catch {}
    setMontado(true);
  }, []);

  function persist(novosAtivos: string[], novoLayout: Layout[]) {
    setAtivos(novosAtivos);
    setLayout(novoLayout);
    try {
      localStorage.setItem(LS_BLOCOS, JSON.stringify(novosAtivos));
      localStorage.setItem(LS_LAYOUT, JSON.stringify(novoLayout));
    } catch {}
  }

  function adicionar(id: string) {
    if (ativos.includes(id)) return;
    const def = BLOCOS.find((b) => b.id === id)!;
    const maxY = layout.reduce((m, it) => Math.max(m, it.y + it.h), 0);
    persist([...ativos, id], [...layout, { i: id, x: 0, y: maxY, w: def.w, h: def.h }]);
  }

  function remover(id: string) {
    persist(ativos.filter((a) => a !== id), layout.filter((l) => l.i !== id));
  }

  function resetar() {
    persist(DEFAULT_BLOCOS, layoutPadrao(DEFAULT_BLOCOS));
  }

  const disponiveis = BLOCOS.filter((b) => !ativos.includes(b.id));

  return (
    <>
      <header className="od-topbar">
        <div className="od-title">Painel <span>Personalizável</span></div>
        <button className="od-btn od-btn-secondary" onClick={resetar}>
          <RotateCcw size={15} /> Resetar
        </button>
      </header>

      {/* paleta de módulos / integrações */}
      <div className="od-panel p-4 mt-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="od-kpilabel mr-2">Módulos disponíveis:</span>
          {disponiveis.length === 0 && <span className="od-muted">Todos adicionados.</span>}
          {disponiveis.map((b) => (
            <button key={b.id} onClick={() => adicionar(b.id)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--od-border)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-xs hover:border-[var(--od-accent)] transition-colors">
              <Plus size={13} className="text-[var(--od-accent)]" /> {b.titulo}
            </button>
          ))}
        </div>
      </div>

      {/* grid arrastável */}
      {montado && (
        <Grid
          className="mt-4"
          layout={layout}
          cols={12}
          rowHeight={70}
          margin={[16, 16]}
          draggableHandle=".pnl-drag"
          onLayoutChange={(l: Layout[]) => persist(ativos, l)}
        >
          {ativos.map((id) => {
            const def = BLOCOS.find((b) => b.id === id);
            if (!def) return null;
            return (
              <div key={id} className="od-panel flex flex-col overflow-hidden">
                <div className="od-panelhead pnl-drag" style={{ cursor: "move" }}>
                  <h2 className="flex items-center gap-2"><GripVertical size={14} className="od-muted" /> {def.titulo}</h2>
                  <button onClick={() => remover(id)} className="od-muted hover:text-[var(--od-red)] transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-hidden">{def.render(data)}</div>
              </div>
            );
          })}
        </Grid>
      )}
    </>
  );
}
