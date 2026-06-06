"use client";

import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ArrowLeft, Truck, User, Calendar, MapPin, Gauge, Fuel, Wrench, Clock, TrendingUp, TrendingDown } from "lucide-react";
import type { AtivoProfile } from "./queries";

const statusLabel: Record<string, string> = {
  EM_OPERACAO: "Em operação", NA_FILA: "Na fila", EM_TRANSITO: "Em trânsito", OCIOSO: "Ocioso", MANUTENCAO: "Manutenção",
};
const statusColor: Record<string, string> = {
  EM_OPERACAO: "var(--od-accent)", NA_FILA: "var(--od-amber)", EM_TRANSITO: "var(--od-blue)", OCIOSO: "var(--od-muted)", MANUTENCAO: "var(--od-red)",
};

export function AtivoProfileClient({ data }: { data: AtivoProfile }) {
  const { ativo, historico, recomendacoes, benchmark } = data;
  const acima = benchmark.diffPct > 0;

  return (
    <>
      <header className="od-topbar">
        <div className="flex items-center gap-3">
          <Link href="/operacao" className="od-navitem" style={{ width: 38, height: 38 }}>
            <ArrowLeft size={18} />
          </Link>
          <div className="od-title">
            <Truck size={22} style={{ color: statusColor[ativo.status] }} />
            {ativo.identificador}
            <span className="od-status" style={{ marginLeft: 8 }}>{statusLabel[ativo.status]}</span>
          </div>
        </div>
      </header>

      {/* identidade */}
      <div className="od-panel p-5 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Info icon={<Truck size={14} />} label="Modelo" value={ativo.modelo ?? "—"} />
          <Info icon={<Calendar size={14} />} label="Ano" value={ativo.ano ? String(ativo.ano) : "—"} />
          <Info icon={<User size={14} />} label="Operador" value={ativo.operador ?? "—"} />
          <Info icon={<MapPin size={14} />} label="Unidade" value={ativo.fazenda?.nome ?? "—"} />
          <Info icon={<Clock size={14} />} label="Horímetro" value={`${ativo.horimetroTotal.toLocaleString("pt-BR")} h`} />
          <Info icon={<Wrench size={14} />} label="Desde manut." value={`${Math.round(ativo.horasDesdeManutencao)} h`} />
        </div>
      </div>

      {/* KPIs + benchmark */}
      <div className="od-kpis mt-4">
        <div className="od-panel od-kpi">
          <span className="od-kpilabel"><Gauge size={12} className="inline mr-1" />Consumo Atual</span>
          <span className="od-kpivalue">{ativo.consumoAtual.toFixed(1)}<small> L/h</small></span>
        </div>
        <div className="od-panel od-kpi">
          <span className="od-kpilabel"><Fuel size={12} className="inline mr-1" />Combustível</span>
          <span className="od-kpivalue" style={(ativo.nivelCombustivel ?? 0) < 15 ? { color: "var(--od-red)" } : undefined}>
            {ativo.nivelCombustivel ?? 0}<small>%</small>
          </span>
        </div>
        <div className="od-panel od-kpi">
          <span className="od-kpilabel">Média da Frota</span>
          <span className="od-kpivalue">{benchmark.mediaFrota.toFixed(1)}<small> L/h</small></span>
        </div>
        <div className="od-panel od-kpi" style={{ borderColor: acima ? "var(--od-red)" : "var(--od-accent)" }}>
          <span className="od-kpilabel">Benchmark</span>
          <span className="od-kpivalue flex items-center gap-1" style={{ color: acima ? "var(--od-red)" : "var(--od-accent)" }}>
            {acima ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {Math.abs(benchmark.diffPct)}<small>% {acima ? "acima" : "abaixo"}</small>
          </span>
        </div>
      </div>

      <div className="od-grid mt-4">
        {/* tendência de consumo */}
        <div className="od-panel od-col">
          <div className="od-panelhead"><h2>Consumo e Combustível por Ciclo</h2></div>
          <div className="p-4" style={{ height: 320 }}>
            {historico.length === 0 ? (
              <div className="od-empty">Sem histórico. Avance a simulação.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historico} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="tick" tick={{ fontSize: 11, fill: "var(--od-muted)" }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11, fill: "var(--od-muted)" }} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: "var(--od-muted)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--od-bg)", borderColor: "var(--od-border)", borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="l" type="monotone" dataKey="consumo" name="Consumo (L/h)" stroke="#00ff9d" strokeWidth={2} dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="nivel" name="Combustível (%)" stroke="#4a9eff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* recomendações do ativo */}
        <div className="od-panel od-col">
          <div className="od-panelhead"><h2>Recomendações deste ativo</h2></div>
          <div className="od-feed">
            {recomendacoes.length === 0 ? (
              <div className="od-empty">Nenhuma recomendação ativa.</div>
            ) : recomendacoes.map((r) => (
              <div key={r.id} className={`od-rec border-l-4 ${
                r.severidade === "ALTA" ? "border-l-[var(--od-red)]" : r.severidade === "MEDIA" ? "border-l-[var(--od-amber)]" : "border-l-[var(--od-blue)]"
              }`}>
                <span className={`od-sev od-sev-${r.severidade}`}>{r.severidade}</span>
                <div className="od-recmsg text-sm">{r.mensagem}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="od-kpilabel flex items-center gap-1">{icon} {label}</div>
      <div className="text-sm font-medium mt-1">{value}</div>
    </div>
  );
}
